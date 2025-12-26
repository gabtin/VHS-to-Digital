import * as client from "openid-client";
import { Strategy as OIDCStrategy, type VerifyFunction as OIDCVerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import { promisify } from "util";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./replit_integrations/auth/storage";
import { type User } from "@shared/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "./lib/email";
import { storage } from "./storage";

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return salt + ":" + derivedKey.toString("hex");
}

async function comparePasswords(supplied: string, stored: string) {
  const [salt, key] = stored.split(":");
  const derivedKey = (await scrypt(supplied, salt, 64)) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
}

const getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.OIDC_ISSUER_URL;
    const clientId = process.env.OIDC_CLIENT_ID;

    if (!issuerUrl || !clientId) {
      throw new Error("OIDC_ISSUER_URL and OIDC_CLIENT_ID must be set");
    }

    return await client.discovery(
      new URL(issuerUrl),
      clientId,
      process.env.OIDC_CLIENT_SECRET
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "development-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  const email = claims["email"]?.toLowerCase();
  const oidcId = claims["sub"];
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const isAdmin = email && adminEmails.includes(email);

  // Try to find by OIDC ID first
  let existingUser = await authStorage.getUserByOidcId(oidcId);

  // If not found, try by email to link accounts
  if (!existingUser && email) {
    existingUser = await authStorage.getUserByEmail(email);
  }

  return await authStorage.upsertUser({
    id: existingUser?.id || undefined, // UUID or undefined for new
    oidcId: oidcId,
    email,
    firstName: claims["first_name"] || claims["given_name"],
    lastName: claims["last_name"] || claims["family_name"],
    profileImageUrl: claims["profile_image_url"] || claims["picture"],
    isAdmin: existingUser?.isAdmin || isAdmin || false,
    emailVerified: true, // OIDC provider verified email
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  let config;
  try {
    config = await getOidcConfig();
  } catch (err) {
    console.warn("OIDC not configured: Auth routes will not work. Set OIDC_ISSUER_URL and OIDC_CLIENT_ID to enable login.");
    return;
  }

  const oidcVerify: OIDCVerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const dbUser = await upsertUser(tokens.claims());
      const sessionUser: any = { id: dbUser.id, claims: tokens.claims() };
      updateUserSession(sessionUser, tokens);
      verified(null, sessionUser);
    } catch (err) {
      verified(err);
    }
  };

  passport.use(
    "oidc",
    new OIDCStrategy(
      {
        config,
        scope: "openid email profile",
        callbackURL: process.env.OIDC_CALLBACK_URL,
      },
      oidcVerify
    )
  );

  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await authStorage.getUserByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => {
    // Store the whole session user object to keep OIDC tokens/expiry
    cb(null, user);
  });

  passport.deserializeUser(async (sessionUser: any, cb) => {
    try {
      // Refresh user data from DB while keeping session-only tokens
      const dbUser = await authStorage.getUser(sessionUser.id);
      if (!dbUser) return cb(null, null);

      const user = { ...dbUser, ...sessionUser };
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const existingUser = await authStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const isAdmin = email && adminEmails.includes(email.toLowerCase());

      const hashedPassword = await hashPassword(password);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours

      const user = await authStorage.upsertUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: isAdmin || false,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      });

      const baseUrl = process.env.APP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : "http://localhost:5050");
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

      await sendVerificationEmail(user.email!, verificationUrl);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const user = await authStorage.getUserByVerificationToken?.(token);
      if (!user || !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      await authStorage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      });

      res.json({ message: "Email verified successfully!" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await authStorage.getUser((req.user as any).id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 3600000); // 24 hours

      await authStorage.updateUser(user.id, {
        verificationToken: token,
        verificationTokenExpiry: expiry,
      });

      const baseUrl = process.env.APP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : "http://localhost:5050");
      const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

      await sendVerificationEmail(user.email!, verificationUrl);

      res.json({ message: "Verification email resent successfully!" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });

      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.get("/api/login/google", passport.authenticate("oidc", {
    prompt: "login consent",
    access_type: "offline",
    scope: ["openid", "email", "profile"],
  } as any));

  app.get("/api/callback", passport.authenticate("oidc", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/auth",
  }));

  app.get("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      const postLogoutRedirectUri = `${req.protocol}://${req.get("host")}`;
      const url = client.buildEndSessionUrl(config, {
        client_id: process.env.OIDC_CLIENT_ID!,
        post_logout_redirect_uri: postLogoutRedirectUri,
      }).href;

      res.redirect(url);
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await authStorage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: "If an account exists with that email, a reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      await authStorage.updateUser(user.id, {
        resetToken: token,
        resetTokenExpiry: expiry,
      });

      const baseUrl = process.env.APP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : "http://localhost:5050");
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, resetUrl);

      res.json({ message: "If an account exists with that email, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      const user = await authStorage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(password);
      await authStorage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      res.json({ message: "Password has been reset successfully." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Helper to get current user info
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const allowedFields = ["firstName", "lastName", "phone", "defaultAddress", "defaultCity", "defaultState", "defaultZip"];
      const updateData: any = {};

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedUser = await authStorage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Logout the user first
      req.logout(async (err: any) => {
        if (err) {
          console.error("Error logging out during account deletion:", err);
          return res.status(500).json({ message: "Failed to delete account" });
        }

        await authStorage.deleteUser(userId);
        res.status(204).send();
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Local users don't have expires_at/tokens
  if (!user.expires_at) {
    return next();
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const ensureAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = (req.user as any).id;
  const dbUser = await authStorage.getUser(userId);

  if (!dbUser || !dbUser.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};

export type { User };
