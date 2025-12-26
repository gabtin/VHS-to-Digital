import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app, setupServer } from "../index";
import { authStorage } from "../replit_integrations/auth/storage";

describe("Email Authentication API", () => {
    beforeAll(async () => {
        await setupServer();
    });

    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: "password123",
        firstName: "Test",
        lastName: "User"
    };

    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/register")
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.email).toBe(testUser.email.toLowerCase());
        expect(res.body.password).toBeDefined();
        expect(res.body.password).not.toBe(testUser.password); // Should be hashed
    });

    it("should not register a user with existing email", async () => {
        const res = await request(app)
            .post("/api/register")
            .send(testUser);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Email already registered");
    });

    it("should login with local credentials", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(testUser.email.toLowerCase());
    });

    it("should fail login with invalid password", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: testUser.email,
                password: "wrong-password"
            });

        expect(res.status).toBe(401);
    });

    it("should return the current user info", async () => {
        // First login to get a session
        const loginRes = await request(app)
            .post("/api/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        const cookie = loginRes.headers["set-cookie"];

        const res = await request(app)
            .get("/api/auth/user")
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(testUser.email.toLowerCase());
    });
});
