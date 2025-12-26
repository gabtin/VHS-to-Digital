import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app, setupServer } from "../index";
import { authStorage } from "../replit_integrations/auth/storage";

describe("Email Verification API", () => {
    const testUser = {
        email: `verify-${Date.now()}@example.com`,
        password: "password123",
        firstName: "Verify",
        lastName: "User"
    };

    let userId: string;
    let userCookie: string;

    beforeAll(async () => {
        await setupServer();
    });

    it("should generate verification token on registration", async () => {
        const res = await request(app)
            .post("/api/register")
            .send(testUser);

        expect(res.status).toBe(201);
        userId = res.body.id;
        userCookie = res.headers["set-cookie"];

        const dbUser = await authStorage.getUser(userId);
        expect(dbUser?.emailVerified).toBe(false);
        expect(dbUser?.verificationToken).toBeDefined();
        expect(dbUser?.verificationTokenExpiry).toBeDefined();
    });

    it("should verify email with valid token", async () => {
        const dbUser = await authStorage.getUser(userId);
        const token = dbUser?.verificationToken;

        const res = await request(app)
            .post("/api/auth/verify-email")
            .send({ token });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("successfully");

        const updatedUser = await authStorage.getUser(userId);
        expect(updatedUser?.emailVerified).toBe(true);
        expect(updatedUser?.verificationToken).toBeNull();
    });

    it("should resend verification token", async () => {
        // First reset verification status for testing resend
        await authStorage.updateUser(userId, { emailVerified: false });

        const res = await request(app)
            .post("/api/auth/resend-verification")
            .set("Cookie", userCookie);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("resent successfully");

        const dbUser = await authStorage.getUser(userId);
        expect(dbUser?.verificationToken).toBeDefined();
    });

    it("should fail verification with invalid token", async () => {
        const res = await request(app)
            .post("/api/auth/verify-email")
            .send({ token: "invalid-token" });

        expect(res.status).toBe(400);
    });
});
