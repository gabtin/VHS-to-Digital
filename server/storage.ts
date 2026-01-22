import { type User, type InsertUser, type Order, type InsertOrder, type OrderNote, type InsertOrderNote, type PricingConfig, type InsertPricingConfig, type ProductAvailability, type InsertProductAvailability, users, orders, orderNotes, pricingConfigs, productAvailability, PRICING, tapeFormats, outputFormats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrderByStripeSessionId(sessionId: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;

  getOrderNotes(orderId: string): Promise<OrderNote[]>;
  createOrderNote(note: InsertOrderNote): Promise<OrderNote>;

  getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }>;

  // New Pricing & Availability methods
  getPricingConfigs(): Promise<PricingConfig[]>;
  updatePricingConfig(key: string, value: string): Promise<PricingConfig | undefined>;
  getProductAvailability(): Promise<ProductAvailability[]>;
  createProductAvailability(data: InsertProductAvailability): Promise<ProductAvailability>;
  updateProductAvailability(name: string, data: Partial<InsertProductAvailability>): Promise<ProductAvailability | undefined>;
  deleteProductAvailability(name: string): Promise<boolean>;
  seedInitialConfigs(): Promise<void>;
}

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RR${year}${month}-${random}`;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async getOrderByStripeSessionId(sessionId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId));
    return order;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderNumber = generateOrderNumber();
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      orderNumber,
    }).returning();
    return order;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(orders.id, id)).returning();
    return order;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return true;
  }

  async getOrderNotes(orderId: string): Promise<OrderNote[]> {
    return db.select().from(orderNotes).where(eq(orderNotes.orderId, orderId)).orderBy(desc(orderNotes.createdAt));
  }

  async createOrderNote(insertNote: InsertOrderNote): Promise<OrderNote> {
    const [note] = await db.insert(orderNotes).values(insertNote).returning();
    return note;
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(orders);
    const [pendingResult] = await db.select({ count: count() }).from(orders).where(
      sql`${orders.status} NOT IN ('complete', 'cancelled')`
    );
    const [completedResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "complete"));
    const [revenueResult] = await db.select({
      total: sql<string>`COALESCE(SUM(${orders.total}), 0)`
    }).from(orders).where(eq(orders.status, "complete"));

    return {
      totalOrders: totalResult?.count ?? 0,
      pendingOrders: pendingResult?.count ?? 0,
      completedOrders: completedResult?.count ?? 0,
      totalRevenue: parseFloat(revenueResult?.total ?? "0"),
    };
  }

  async getPricingConfigs(): Promise<PricingConfig[]> {
    return db.select().from(pricingConfigs);
  }

  async updatePricingConfig(key: string, value: string): Promise<PricingConfig | undefined> {
    const [config] = await db.update(pricingConfigs)
      .set({ value, updatedAt: new Date() })
      .where(eq(pricingConfigs.key, key))
      .returning();
    return config;
  }

  async getProductAvailability(): Promise<ProductAvailability[]> {
    return db.select().from(productAvailability);
  }

  async createProductAvailability(data: InsertProductAvailability): Promise<ProductAvailability> {
    const [availability] = await db.insert(productAvailability).values(data).returning();
    return availability;
  }

  async updateProductAvailability(name: string, data: Partial<InsertProductAvailability>): Promise<ProductAvailability | undefined> {
    const [availability] = await db.update(productAvailability)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productAvailability.name, name))
      .returning();
    return availability;
  }

  async deleteProductAvailability(name: string): Promise<boolean> {
    const [existing] = await db.select().from(productAvailability).where(eq(productAvailability.name, name));
    if (!existing) return false;

    // Prevent deletion of "core" services that aren't dynamic? 
    // For now, allow deletion of any.
    await db.delete(productAvailability).where(eq(productAvailability.name, name));
    return true;
  }

  async seedInitialConfigs(): Promise<void> {
    // Seed pricing if empty
    const existingPricing = await this.getPricingConfigs();
    if (!existingPricing || existingPricing.length === 0) {
      const initialPricing = [
        { key: "basePricePerTape", value: PRICING.basePricePerTape.toString(), description: "Base price per tape" },
        { key: "pricePerHour", value: PRICING.pricePerHour.toString(), description: "Price per hour of conversion" },
        { key: "usbDrive", value: PRICING.usbDrive.toString(), description: "Price for USB drive" },
        { key: "dvdPerDisc", value: PRICING.dvdPerDisc.toString(), description: "Price per DVD disc" },
        { key: "cloudStorage", value: PRICING.cloudStorage.toString(), description: "Price for cloud storage link" },
        { key: "returnShipping", value: PRICING.returnShipping.toString(), description: "Return shipping fee" },
        { key: "rushMultiplier", value: PRICING.rushMultiplier.toString(), description: "Multiplier for rush processing (0.5 = 50% extra)" },
      ];
      await db.insert(pricingConfigs).values(initialPricing);
    }

    // Seed availability if empty
    const existingAvailability = await this.getProductAvailability();
    if (!existingAvailability || existingAvailability.length === 0) {
      const tapeInitial = tapeFormats.map(name => ({
        type: "tape_format" as const,
        name,
        isActive: true,
        label: name.toUpperCase()
      }));
      const outputInitial = outputFormats.map(name => {
        let price = "0";
        if (name === "usb") price = PRICING.usbDrive.toString();
        if (name === "dvd") price = PRICING.dvdPerDisc.toString();
        if (name === "cloud") price = PRICING.cloudStorage.toString();

        return {
          type: "output_format" as const,
          name,
          isActive: true,
          label: name.toUpperCase(),
          price
        };
      });
      await db.insert(productAvailability).values([...tapeInitial, ...outputInitial]);
    }
  }
}

export const storage = new DatabaseStorage();
