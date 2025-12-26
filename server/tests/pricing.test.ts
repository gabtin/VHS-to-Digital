import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app, setupServer } from "../index";
import { storage } from "../storage";

describe("Pricing API", () => {
    beforeAll(async () => {
        // Wait for server to be fully setup (auth, routes, etc.)
        await setupServer();
        // Ensure initial configs are seeded
        await storage.seedInitialConfigs();
    });

    it("should return public pricing configurations", async () => {
        const response = await request(app).get("/api/pricing");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const basePrice = response.body.find((p: any) => p.key === "basePricePerTape");
        expect(basePrice).toBeDefined();
        expect(basePrice.value).toBe("25.00");
    });

    it("should calculate pricing correctly for a simple order", async () => {
        const orderConfig = {
            tapeFormats: { vhs: 1 },
            totalTapes: 1,
            estimatedHours: 2,
            outputFormats: ["mp4"],
            tapeHandling: "return",
            processingSpeed: "standard",
            shippingName: "Test User",
            shippingAddress: "123 Test St",
            shippingCity: "Test City",
            shippingState: "TS",
            shippingZip: "12345"
        };

        const response = await request(app)
            .post("/api/pricing/calculate")
            .send(orderConfig);

        expect(response.status).toBe(200);
        // 25 (base) + (2 * 10) (hours) + 5 (shipping) = 50
        expect(response.body.total).toBe(50);
    });

    it("should include rush fees in calculation", async () => {
        const orderConfig = {
            tapeFormats: { vhs: 1 },
            totalTapes: 1,
            estimatedHours: 1,
            outputFormats: ["mp4"],
            tapeHandling: "return",
            processingSpeed: "rush",
            shippingName: "Test User",
            shippingAddress: "123 Test St",
            shippingCity: "Test City",
            shippingState: "TS",
            shippingZip: "12345"
        };

        const response = await request(app)
            .post("/api/pricing/calculate")
            .send(orderConfig);

        expect(response.status).toBe(200);
        // (25 base + 10 hour + 5 shipping) = 40 subtotal. 40 * 0.5 = 20 rush. Total = 60
        expect(response.body.total).toBe(60);
        expect(response.body.rushFee).toBe(20);
    });
});
