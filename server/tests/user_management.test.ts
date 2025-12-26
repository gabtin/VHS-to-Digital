import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app, setupServer } from "../index";
import { authStorage } from "../replit_integrations/auth/storage";

describe("User Management API", () => {
    const testUser = {
        email: `test-mgt-${Date.now()}@example.com`,
        password: "password123",
        firstName: "Test",
        lastName: "Mgt"
    };

    let userCookie: string;
    let userId: string;

    beforeAll(async () => {
        await setupServer();
        // Register and login to get cookie
        const res = await request(app)
            .post("/api/register")
            .send(testUser);

        userCookie = res.headers["set-cookie"];
        userId = res.body.id;
    });

    it("should update user profile", async () => {
        const updateData = {
            firstName: "Updated",
            phone: "1234567890"
        };

        const res = await request(app)
            .patch("/api/auth/user")
            .set("Cookie", userCookie)
            .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body.firstName).toBe("Updated");
        expect(res.body.phone).toBe("1234567890");

        // Verify in DB
        const dbUser = await authStorage.getUser(userId);
        expect(dbUser?.firstName).toBe("Updated");
    });

    it("should handle forgot password request", async () => {
        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: testUser.email });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("reset link has been sent");

        // Verify token generated in DB
        const dbUser = await authStorage.getUser(userId);
        expect(dbUser?.resetToken).toBeDefined();
        expect(dbUser?.resetTokenExpiry).toBeDefined();
    });

    it("should reset password with valid token", async () => {
        const dbUser = await authStorage.getUser(userId);
        const token = dbUser?.resetToken;

        const res = await request(app)
            .post("/api/auth/reset-password")
            .send({ token, password: "newpassword123" });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("successfully");

        // Verify token cleared and password changed
        const updatedUser = await authStorage.getUser(userId);
        expect(updatedUser?.resetToken).toBeNull();

        // Try login with new password
        const loginRes = await request(app)
            .post("/api/login")
            .send({ email: testUser.email, password: "newpassword123" });

        expect(loginRes.status).toBe(200);
    });

    it("should delete user account", async () => {
        const res = await request(app)
            .delete("/api/auth/user")
            .set("Cookie", userCookie);

        expect(res.status).toBe(204);

        // Verify deleted in DB
        const dbUser = await authStorage.getUser(userId);
        expect(dbUser).toBeUndefined();

        // Verify session cleared
        const userRes = await request(app)
            .get("/api/auth/user")
            .set("Cookie", userCookie);

        expect(userRes.status).toBe(401);
    });
});
