import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./replit_integrations/auth/storage";
import { type User } from "@shared/schema";

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
  const email = claims["email"];
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const isAdmin = email && adminEmails.includes(email.toLowerCase());

  return await authStorage.upsertUser({
    id: claims["sub"],
    email,
    firstName: claims["first_name"] || claims["given_name"],
    lastName: claims["last_name"] || claims["family_name"],
    profileImageUrl: claims["profile_image_url"] || claims["picture"],
    isAdmin: isAdmin || false,
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

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user: any = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    } catch (err) {
      verified(err);
    }
  };

  passport.use(
    "oidc",
    new Strategy(
      {
        config,
        scope: "openid email profile",
        callbackURL: process.env.OIDC_CALLBACK_URL,
      },
      verify
    )
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", passport.authenticate("oidc", {
    prompt: "login consent",
    access_type: "offline",
    scope: ["openid", "email", "profile"],
  } as any));

  app.get("/api/callback", passport.authenticate("oidc", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/api/login",
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

  // Helper to get current user info
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
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

  const userId = (req.user as any).claims.sub;
  const dbUser = await authStorage.getUser(userId);

  if (!dbUser || !dbUser.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};

export type { User };
