
interface SendcloudMethod {
    id: number;
    name: string;
    carrier: string;
    price: number;
    currency: string;
    to_post_number: boolean; // if true, it's a service point method
}

interface Address {
    city: string;
    country: string;
    zip: string;
}

interface Parcel {
    weight: number;
    width: number;
    height: number;
    length: number;
}

export class SendcloudService {
    private baseUrl = "https://panel.sendcloud.sc/api/v2";

    private getHeaders() {
        const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
        const secretKey = process.env.SENDCLOUD_SECRET_KEY;

        if (!publicKey || !secretKey) {
            throw new Error("Sendcloud API Credentials missing.");
        }

        const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
        return {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json"
        };
    }

    private localizeServiceName(name: string): string {
        const mappings: Record<string, string> = {
            "unstamped letter": "Spedizione Standard Postale",
            "service point": "Punto di Ritiro",
            "home delivery": "Consegna a Domicilio"
        };

        const lowerName = name.toLowerCase();
        for (const [key, value] of Object.entries(mappings)) {
            if (lowerName.includes(key)) return value;
        }

        return name;
    }

    /**
     * Get Shipping Rates (Methods + Prices)
     * Sendcloud V2 requires getting methods first, then (optionally) specific prices.
     * But the "shipping_methods" endpoint often returns a price indicative of the generic configuration.
     * For accurate pricing based on weight, we should use the `shipping_price` endpoint or filter the methods response carefully.
     * 
     * However, the simplest start is: GET /shipping_methods?from_country=IT&to_country=IT&weight=...
     */
    async getRates(from: Address, to: Address, parcels: Parcel[]): Promise<any[]> {
        try {
            // Calculate total weight
            const totalWeight = parcels.reduce((sum, p) => sum + p.weight, 0);

            // 1. Fetch available shipping methods for this route/weight
            // Note: Sendcloud allows filtering by from_country, to_country, weight
            const params = new URLSearchParams({
                from_postal_code: from.zip,
                from_country: from.country,
                to_postal_code: to.zip,
                to_country: to.country,
                weight: totalWeight.toString(), // Sendcloud usually takes weight in kilograms, as per docs.
            });

            const url = `${this.baseUrl}/shipping_methods?${params.toString()}`;
            console.log("Fetching Sendcloud Rates:", url);

            const response = await fetch(url, { headers: this.getHeaders() });

            if (!response.ok) {
                const err = await response.text();
                console.error("Sendcloud Rates Error:", err);
                throw new Error(`Sendcloud error: ${response.statusText}`);
            }

            const data = await response.json();
            const methods = data.shipping_methods || [];

            return methods.map((m: any) => {
                // Determine price. Sendcloud returns 'price' in the method object for the given query params.
                return {
                    serviceId: m.id.toString(),
                    carrierName: m.carrier.toUpperCase(),
                    serviceName: this.localizeServiceName(m.name),
                    price: m.price, // Raw price
                    currency: 'EUR', // Sendcloud usually returns in account currency
                    type: m.to_post_number ? "pickup" : "dropoff", // 'to_post_number' usually implies service point delivery
                    estimatedDays: 3, // Defaults, Sendcloud might not return transit time in this endpoint
                    logoUrl: null // We might need a map for logos or fetch separately
                };
            });

        } catch (error) {
            console.error("Sendcloud getRates failed:", error);
            throw error;
        }
    }

    /**
     * Get Service Points (Pickup Locations)
     * Now using the real SendCloud Service Points API
     */
    async getServicePoints(country: string, city: string, zip: string, radius: number = 5000): Promise<any[]> {
        // Common carriers available in Italy for service points
        const carriers = ["poste_italiane", "brt", "ups", "dhl", "gls"];

        const params = new URLSearchParams({
            country: country,
            postal_code: zip,
            radius: radius.toString(), // in meters
            carriers: carriers.join(",")
        });

        // Only add city if provided (postal_code is usually sufficient)
        if (city) {
            params.append("city", city);
        }

        // Service Points API has a different base URL
        const url = `https://servicepoints.sendcloud.sc/api/v2/service-points?${params.toString()}`;
        console.log("Fetching Service Points:", url);

        const response = await fetch(url, { headers: this.getHeaders() });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Service Points Error:", errorText);
            throw new Error(`Service Points API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Normalize the response to ensure consistent field names for frontend
        const servicePoints = Array.isArray(data) ? data : (data.service_points || data.servicepoints || []);

        return servicePoints.map((point: any) => ({
            id: point.id,
            name: point.name,
            street: point.street || point.address,
            house_number: point.house_number || "",
            city: point.city,
            postal_code: point.postal_code,
            country: point.country,
            carrier: point.carrier,
            latitude: point.latitude,
            longitude: point.longitude,
            distance: point.distance,
            open_tomorrow: point.open_tomorrow,
            opening_hours: point.formatted_opening_times || point.opening_hours
        }));
    }

    /**
     * Get mock service points - for testing purposes only
     * @internal
     */
    _getMockServicePoints(): any[] {
        return [
            {
                id: 12345,
                name: "Mock Pickup Point 1",
                street: "Via Dante 10",
                city: "Milano",
                postal_code: "20121",
                carrier: "ups",
                latitude: "45.4642",
                longitude: "9.1900"
            },
            {
                id: 67890,
                name: "Mock Pickup Point 2",
                street: "Piazza Duomo 1",
                city: "Milano",
                postal_code: "20121",
                carrier: "brt",
                latitude: "45.4641",
                longitude: "9.1897"
            }
        ];
    }

    /**
     * Create a Parcel (Booking)
     * For Inbound flow: Parcel Address = Lab Address, User info = Sender
     */
    async createParcel(order: any, serviceId: string, isDraft: boolean = false): Promise<{ reference: string, labelUrl?: string, trackingUrl?: string }> {
        const labAddress = {
            name: "VHS to Digital Lab",
            address: process.env.LAB_ADDRESS_STREET || "Via Roma 1",
            city: process.env.LAB_ADDRESS_CITY || "Milano",
            postal_code: process.env.LAB_ADDRESS_ZIP || "20121",
            country: process.env.LAB_ADDRESS_COUNTRY || "IT",
            phone: process.env.LAB_PHONE || "3331234567"
        };

        const payload = {
            parcel: {
                // Destination is the Lab
                name: labAddress.name,
                address: labAddress.address,
                city: labAddress.city,
                postal_code: labAddress.postal_code,
                country: labAddress.country,
                telephone: labAddress.phone,

                // Sender details (User)
                email: order.email,
                shipping_method: parseInt(serviceId),
                shipping_method_id: parseInt(serviceId),
                request_label: !isDraft,
                weight: order.totalWeight ? (order.totalWeight / 1000).toFixed(3) : "1.000",

                // Extra fields for the label to identify the client
                external_reference: order.orderNumber || null,
            }
        };

        console.log("Creating Sendcloud Parcel:", JSON.stringify(payload, null, 2));

        const response = await fetch(`${this.baseUrl}/parcels`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();

        if (!response.ok) {
            console.error("Sendcloud Booking Error:", rawText);
            throw new Error(`Sendcloud Booking Failed: ${response.statusText}`);
        }

        const data = JSON.parse(rawText);
        const parcel = data.parcel;

        return {
            reference: parcel.id.toString(),
            labelUrl: parcel.label ? parcel.label.label_printer : null,
            trackingUrl: parcel.tracking_url
        };
    }
}

export const sendcloudService = new SendcloudService();
