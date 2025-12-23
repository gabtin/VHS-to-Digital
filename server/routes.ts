import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOrderSchema, insertOrderNoteSchema, orderConfigSchema, PRICING, type TapeFormat, type OutputFormat } from "@shared/schema";
import { z } from "zod";

function calculatePricing(config: z.infer<typeof orderConfigSchema>) {
  const totalTapes = Object.values(config.tapeFormats as Record<string, number>).reduce((sum, qty) => sum + qty, 0);
  let subtotal = totalTapes * PRICING.basePricePerTape;
  subtotal += config.estimatedHours * PRICING.pricePerHour;
  
  if (config.outputFormats.includes("usb")) {
    subtotal += PRICING.usbDrive;
  }
  if (config.outputFormats.includes("dvd") && config.dvdQuantity) {
    subtotal += config.dvdQuantity * PRICING.dvdPerDisc;
  }
  if (config.outputFormats.includes("cloud")) {
    subtotal += PRICING.cloudStorage;
  }
  if (config.tapeHandling === "return") {
    subtotal += PRICING.returnShipping;
  }
  
  const rushFee = config.processingSpeed === "rush" ? subtotal * PRICING.rushMultiplier : 0;
  const total = subtotal + rushFee;
  
  return { subtotal, rushFee, total };
}

const shippingInfoSchema = z.object({
  shippingName: z.string().min(1),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingState: z.string().min(1),
  shippingZip: z.string().min(1),
  shippingPhone: z.string().optional(),
});

const createOrderSchema = orderConfigSchema.merge(shippingInfoSchema).extend({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ USER ROUTES ============
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(parsed.email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      const user = await storage.createUser(parsed);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/email/:email", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // ============ ORDER ROUTES ============
  
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const parsed = createOrderSchema.parse(req.body);
      
      let user = await storage.getUserByEmail(parsed.email);
      if (!user) {
        user = await storage.createUser({
          email: parsed.email,
          name: parsed.name,
          phone: parsed.shippingPhone || null,
          defaultAddress: parsed.shippingAddress,
          defaultCity: parsed.shippingCity,
          defaultState: parsed.shippingState,
          defaultZip: parsed.shippingZip,
        });
      }
      
      const totalTapes = Object.values(parsed.tapeFormats as Record<string, number>).reduce((sum, qty) => sum + qty, 0);
      const pricing = calculatePricing(parsed);
      
      const order = await storage.createOrder({
        userId: user.id,
        status: "pending",
        tapeFormats: parsed.tapeFormats as Record<TapeFormat, number>,
        totalTapes,
        estimatedHours: parsed.estimatedHours,
        outputFormats: parsed.outputFormats as OutputFormat[],
        dvdQuantity: parsed.dvdQuantity || 0,
        tapeHandling: parsed.tapeHandling,
        processingSpeed: parsed.processingSpeed,
        shippingName: parsed.shippingName,
        shippingAddress: parsed.shippingAddress,
        shippingCity: parsed.shippingCity,
        shippingState: parsed.shippingState,
        shippingZip: parsed.shippingZip,
        shippingPhone: parsed.shippingPhone || null,
        specialInstructions: parsed.specialInstructions || null,
        isGift: parsed.isGift || false,
        subtotal: pricing.subtotal.toFixed(2),
        rushFee: pricing.rushFee.toFixed(2),
        total: pricing.total.toFixed(2),
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Create order error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/number/:orderNumber", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/user/:userId", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrdersByUserId(req.params.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const existingOrder = await storage.getOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const updateData: Record<string, unknown> = {};
      const allowedFields = ["status", "trackingNumber", "downloadUrl", "dueDate", "completedAt"];
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      if (updateData.status === "complete" && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }
      
      const order = await storage.updateOrder(req.params.id, updateData);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      await storage.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // ============ ORDER NOTES ROUTES ============
  
  app.get("/api/orders/:orderId/notes", async (req: Request, res: Response) => {
    try {
      const notes = await storage.getOrderNotes(req.params.orderId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/orders/:orderId/notes", async (req: Request, res: Response) => {
    try {
      const parsed = insertOrderNoteSchema.parse({
        ...req.body,
        orderId: req.params.orderId,
      });
      const note = await storage.createOrderNote(parsed);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  // ============ ADMIN STATS ROUTES ============
  
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ============ PRICING CALCULATOR ============
  
  app.post("/api/pricing/calculate", async (req: Request, res: Response) => {
    try {
      const parsed = orderConfigSchema.parse(req.body);
      const pricing = calculatePricing(parsed);
      res.json(pricing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to calculate pricing" });
    }
  });

  return httpServer;
}
