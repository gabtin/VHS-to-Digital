import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import { app, setupServer } from "../index";
import { sendcloudService } from "../services/sendcloud";

// Mock global fetch
global.fetch = vi.fn();

describe("Sendcloud Integration", () => {
    beforeAll(async () => {
        await setupServer();
    });

    describe("Service Logic", () => {
        it("getServicePoints should throw error when API fails (no more mock fallback)", async () => {
            // Mock a 400 error
            (fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: () => Promise.resolve(JSON.stringify({
                    error: { message: "Some API error" }
                })),
                json: () => Promise.resolve({
                    error: { message: "Some API error" }
                })
            });

            await expect(sendcloudService.getServicePoints("IT", "Milano", "20121"))
                .rejects.toThrow("Service Points API Error");
        });

        it("getServicePoints should return normalized real API data", async () => {
            // Mock real SendCloud response structure
            (fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 999,
                        name: "Real Point",
                        street: "Real Street",
                        city: "Milan",
                        postal_code: "20121",
                        carrier: "ups",
                        latitude: "45.0",
                        longitude: "9.0"
                    }
                ])
            });

            const points = await sendcloudService.getServicePoints("IT", "Milano", "20121");
            expect(points.length).toBe(1);
            expect(points[0]).toMatchObject({
                name: "Real Point",
                street: "Real Street",
                carrier: "ups"
            });
        });

        it("createParcel should generate correct inbound payload (destination = Lab)", async () => {
            (fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    parcel: { id: 123, label: { label_printer: "http://label.url" }, tracking_url: "http://track.url" }
                }),
                text: () => Promise.resolve('{"parcel": {"id": 123}}')
            });

            const orderMock = {
                email: "customer@example.com",
                totalWeight: 2000,
                orderNumber: "ORD-123"
            };

            const result = await sendcloudService.createParcel(orderMock, "8", true);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/parcels"),
                expect.objectContaining({
                    method: "POST",
                    body: expect.stringContaining('"postal_code":"20121"') // Lab ZIP
                })
            );
            expect(result.reference).toBe("123");
        });
    });

    describe("API Endpoints", () => {
        it("POST /api/shipping/rates should return 200", async () => {
            // Mock successful rates response
            (fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    shipping_methods: [{ id: 8, name: "Test Method", carrier: "Test", price: 0 }]
                }),
                text: () => Promise.resolve(JSON.stringify({
                    shipping_methods: [{ id: 8, name: "Test Method", carrier: "Test", price: 0 }]
                }))
            });

            const response = await request(app)
                .post("/api/shipping/rates")
                .send({
                    from: { country: "IT", zip: "70015" },
                    to: { country: "IT", zip: "20121" },
                    parcels: [{ weight: 1, width: 10, height: 10, length: 10 }]
                });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it("GET /api/shipping/service-points should return 500 when API fails", async () => {
            // Mock 400 error
            (fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: () => Promise.resolve('{"error": "inactive"}')
            });

            const response = await request(app)
                .get("/api/shipping/service-points?country=IT&city=Milano&zip=20121");

            expect(response.status).toBe(500);
        });
    });
});
