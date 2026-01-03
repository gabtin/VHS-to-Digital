
interface Parcel {
    weight: number;
    width: number;
    height: number;
    length: number;
}

interface Address {
    city: string;
    country: string;
    zip: string;
}

interface ShippingRate {
    serviceId: string;
    carrierName: string;
    serviceName: string;
    price: number;
    currency: string;
    estimatedDays: number;
    type: "pickup" | "dropoff";
    logoUrl?: string;
}

const API_URL = "https://api.packlink.com/v1";

export class PacklinkService {
    private async getHeaders() {
        const apiKey = process.env.PACKLINK_API_KEY;
        return {
            "Authorization": `${apiKey}`,
            "Content-Type": "application/json"
        };
    }

    calculateParcels(totalTapes: number, dvdQuantity: number = 0): Parcel[] {
        const tapeWeight = totalTapes * 0.35;
        const dvdWeight = dvdQuantity * 0.1;
        const packagingWeight = 0.5;

        const totalWeight = Math.max(1, tapeWeight + dvdWeight + packagingWeight);

        let width = 30, height = 15, length = 20;

        if (totalWeight > 2 && totalWeight <= 5) {
            width = 40; height = 20; length = 30;
        } else if (totalWeight > 5) {
            width = 50; height = 30; length = 40;
        }

        return [{
            weight: parseFloat(totalWeight.toFixed(2)),
            width,
            height,
            length
        }];
    }

    async getRates(from: Address, to: Address, parcels: Parcel[]): Promise<ShippingRate[]> {
        const apiKey = process.env.PACKLINK_API_KEY;
        if (!apiKey) {
            throw new Error("Packlink API Key is missing. Please check your .env file.");
        }

        try {
            const queryParams = new URLSearchParams();
            queryParams.append("platform", "PRO");
            queryParams.append("from[country]", from.country || "IT");
            queryParams.append("from[zip]", from.zip);
            if (from.city) queryParams.append("from[city]", from.city);
            queryParams.append("to[country]", to.country || "IT");
            queryParams.append("to[zip]", to.zip);
            if (to.city) queryParams.append("to[city]", to.city);

            parcels.forEach((p, i) => {
                queryParams.append(`packages[${i}][weight]`, p.weight.toString());
                queryParams.append(`packages[${i}][width]`, p.width.toString());
                queryParams.append(`packages[${i}][height]`, p.height.toString());
                queryParams.append(`packages[${i}][length]`, p.length.toString());
            });

            const fullUrl = `${API_URL}/services?${queryParams.toString()}`;
            console.log("Calling Packlink API:", fullUrl);

            const response = await fetch(fullUrl, {
                headers: await this.getHeaders(),
            });

            const rawText = await response.text();

            if (!response.ok) {
                let errorDetails;
                try {
                    errorDetails = JSON.parse(rawText);
                } catch (e) {
                    errorDetails = rawText;
                }

                console.error("Packlink API Error Details:", JSON.stringify(errorDetails, null, 2));
                throw new Error(`Packlink API error (${response.status}): ${response.statusText}`);
            }

            const data = JSON.parse(rawText) as any[];

            return data.map(item => {
                // Packlink API might return total_price or base_price depending on account settings/region
                const priceValue = item.total_price || item.base_price || 0;
                const totalPrice = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;

                return {
                    serviceId: item.id.toString(),
                    carrierName: item.carrier_name,
                    serviceName: item.service_name,
                    // Apply 10% Markup
                    price: parseFloat((totalPrice * 1.10).toFixed(2)),
                    currency: item.currency || 'EUR',
                    estimatedDays: parseInt(item.transit_time?.split(" ")[0]) || 3,
                    type: (item.service_type === "pickup" ? "pickup" : "dropoff") as "pickup" | "dropoff",
                    logoUrl: item.carrier_logo
                };
            })
                // Sort by price ascending
                .sort((a, b) => a.price - b.price)
                // Filter logic: 3 Cheapest + Pickup prioritized
                .filter((rate, index, allRates) => {
                    // If we have less than 3 rates, show all
                    if (allRates.length <= 3) return true;

                    // Always show the absolute cheapest
                    if (index === 0) return true;

                    // Identify the cheapest pickup option
                    const cheapestPickup = allRates.find(r => r.type === 'pickup');

                    // Determine the "must keep" list
                    // 1. Absolute Cheapest (index 0)
                    // 2. Cheapest Pickup (if exists and is different from index 0)
                    const mustKeepIds = [allRates[0].serviceId];
                    if (cheapestPickup && cheapestPickup.serviceId !== allRates[0].serviceId) {
                        mustKeepIds.push(cheapestPickup.serviceId);
                    }

                    // If this rate is essential, keep it
                    if (mustKeepIds.includes(rate.serviceId)) return true;

                    // For the remaining slots (up to 3 total):
                    // Count how many "must keep" we have
                    const securedCount = mustKeepIds.length;
                    const needingMore = 3 - securedCount;

                    // Find IDs of the next cheapest options that fill the gap
                    // Exclude already kept ones
                    const nextBest = allRates
                        .filter(r => !mustKeepIds.includes(r.serviceId))
                        .slice(0, needingMore)
                        .map(r => r.serviceId);

                    return nextBest.includes(rate.serviceId);
                });

        } catch (error) {
            console.error("Packlink API Request Failed:", error);
            throw error;
        }
    }

    async createShipment(
        userAddress: Address & { name: string; email: string; phone: string; street: string },
        serviceId: string,
        parcels: Parcel[],
        dropoffPointId?: string
    ): Promise<{ reference: string, labelUrl?: string }> {
        const apiKey = process.env.PACKLINK_API_KEY;
        if (!apiKey) throw new Error("Packlink API Key is missing.");

        const labAddress = {
            name: "Lab VHS to Digital",
            surname: "Inbound",
            company: "VHS to Digital",
            street: process.env.LAB_ADDRESS_STREET || "Via Roma 1",
            city: process.env.LAB_ADDRESS_CITY || "Milano",
            zip: process.env.LAB_ADDRESS_ZIP || "20121",
            country: process.env.LAB_ADDRESS_COUNTRY || "IT",
            phone: process.env.LAB_PHONE || "3331234567",
            email: process.env.LAB_EMAIL || "lab@example.com"
        };


        const payload = {
            service_id: serviceId,
            collection: {
                name: userAddress.name,
                surname: ".",
                street1: userAddress.street,
                city: userAddress.city,
                zip: userAddress.zip,
                country: userAddress.country,
                phone: userAddress.phone,
                email: userAddress.email
            },
            delivery: {
                name: labAddress.name,
                surname: labAddress.surname,
                street1: labAddress.street,
                city: labAddress.city,
                zip: labAddress.zip,
                country: labAddress.country,
                phone: labAddress.phone,
                email: labAddress.email
            },
            packages: parcels.map(p => ({
                weight: p.weight,
                width: p.width,
                height: p.height,
                length: p.length
            })),
            content: "VHS Tapes Conversion",
            content_second_hand: true, // Used goods
            source: "PRO",
            dropoff_point_id: dropoffPointId
        };

        console.log("Creating Packlink Shipment:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(`${API_URL}/shipments`, {
                method: "POST",
                headers: await this.getHeaders(),
                body: JSON.stringify(payload)
            });

            const rawText = await response.text();

            if (!response.ok) {
                console.error("Packlink Shipment Error:", rawText);
                throw new Error(`Packlink Shipment Failed: ${response.statusText}`);
            }

            const data = JSON.parse(rawText);
            console.log("Shipment Created:", data);

            return { reference: data.reference };

        } catch (error) {
            console.error("Create Shipment Failed:", error);
            throw error;
        }
    }
}

export const packlinkService = new PacklinkService();
