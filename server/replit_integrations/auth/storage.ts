import { users, type UpsertUser, type AuthUser } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<AuthUser | undefined>;
  getUserByEmail(email: string): Promise<AuthUser | undefined>;
  getUserByOidcId(oidcId: string): Promise<AuthUser | undefined>;
  getUserByResetToken(token: string): Promise<AuthUser | undefined>;
  getUserByVerificationToken(token: string): Promise<AuthUser | undefined>;
  upsertUser(user: UpsertUser): Promise<AuthUser>;
  deleteUser(id: string): Promise<void>;
  updateUser(id: string, data: Partial<AuthUser>): Promise<AuthUser>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserByOidcId(oidcId: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.oidcId, oidcId));
    return user;
  }

  async getUserByResetToken(token: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUser(id: string, data: Partial<AuthUser>): Promise<AuthUser> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<AuthUser> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
