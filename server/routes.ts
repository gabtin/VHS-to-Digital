import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOrderSchema, insertOrderNoteSchema, orderConfigSchema, PRICING, type TapeFormat, type OutputFormat } from "@shared/schema";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { isAuthenticated, ensureAdmin } from "./auth";

async function calculatePricing(config: z.infer<typeof orderConfigSchema>) {
  const configs = await storage.getPricingConfigs();
  const pricing: Record<string, number> = {};
  configs.forEach(c => {
    pricing[c.key] = parseFloat(c.value);
  });

  // Fallback to PRICING constants if DB is missing values (shouldn't happen with seeding)
  const getPrice = (key: string, fallback: number) => pricing[key] ?? fallback;

  const totalTapes = Object.values(config.tapeFormats as Record<string, number>).reduce((sum, qty) => sum + qty, 0);
  let subtotal = totalTapes * getPrice("basePricePerTape", PRICING.basePricePerTape);
  subtotal += config.estimatedHours * getPrice("pricePerHour", PRICING.pricePerHour);

  if (config.outputFormats.includes("usb")) {
    subtotal += getPrice("usbDrive", PRICING.usbDrive);
  }
  if (config.outputFormats.includes("dvd") && config.dvdQuantity) {
    subtotal += config.dvdQuantity * getPrice("dvdPerDisc", PRICING.dvdPerDisc);
  }
  if (config.outputFormats.includes("cloud")) {
    subtotal += getPrice("cloudStorage", PRICING.cloudStorage);
  }
  if (config.tapeHandling === "return") {
    subtotal += getPrice("returnShipping", PRICING.returnShipping);
  }

  const rushMultiplier = getPrice("rushMultiplier", PRICING.rushMultiplier);
  const rushFee = config.processingSpeed === "rush" ? subtotal * rushMultiplier : 0;
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
      if (parsed.email) {
        const existingUser = await storage.getUserByEmail(parsed.email);
        if (existingUser) {
          return res.status(400).json({ error: "User with this email already exists" });
        }
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

  app.get("/api/users/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Users can only view their own profile, unless admin
      const authUser = req.user as any;
      if (authUser.id !== req.params.id) {
        const dbUser = await storage.getUser(authUser.id);
        if (!dbUser?.isAdmin) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/email/:email", ensureAdmin, async (req: Request, res: Response) => {
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
      const pricing = await calculatePricing(parsed);

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

  // ============ STRIPE CHECKOUT ROUTES ============

  app.get("/api/stripe/publishable-key", async (req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Get publishable key error:", error);
      res.status(500).json({ error: "Failed to get Stripe publishable key" });
    }
  });

  app.post("/api/stripe/create-checkout-session", async (req: Request, res: Response) => {
    try {
      const { orderConfig, shippingInfo } = req.body;

      const parsedConfig = orderConfigSchema.parse(orderConfig);
      const parsedShipping = shippingInfoSchema.extend({
        email: z.string().email(),
        name: z.string().min(1),
      }).parse(shippingInfo);

      const serverPricing = await calculatePricing(parsedConfig);

      const stripe = await getUncachableStripeClient();

      const baseUrl = process.env.APP_URL ||
        (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : "http://localhost:5050");

      const totalTapes = Object.values(parsedConfig.tapeFormats as Record<string, number>).reduce((sum: number, qty: number) => sum + qty, 0);

      const lineItems: any[] = [];

      if (totalTapes > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `VHS-to-Digital Conversion (${totalTapes} tapes)`,
              description: `${parsedConfig.estimatedHours} hours of footage`,
            },
            unit_amount: Math.round(serverPricing.subtotal * 100),
          },
          quantity: 1,
        });
      }

      if (serverPricing.rushFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Rush Processing Fee',
              description: 'Priority 3-5 day processing',
            },
            unit_amount: Math.round(serverPricing.rushFee * 100),
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?cancelled=true`,
        customer_email: parsedShipping.email,
        metadata: {
          orderConfig: JSON.stringify(parsedConfig),
          shippingInfo: JSON.stringify(parsedShipping),
          serverPricing: JSON.stringify(serverPricing),
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("Create checkout session error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  app.get("/api/stripe/session/:sessionId", async (req: Request, res: Response) => {
    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
      res.json({ session });
    } catch (error: any) {
      console.error("Get session error:", error);
      res.status(500).json({ error: error.message || "Failed to get session" });
    }
  });

  app.post("/api/stripe/verify-and-create-order", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const existingOrder = await storage.getOrderByStripeSessionId(sessionId);
      if (existingOrder) {
        return res.json({ order: existingOrder, session: { id: sessionId } });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      if (!session.metadata?.orderConfig || !session.metadata?.shippingInfo || !session.metadata?.serverPricing) {
        return res.status(400).json({ error: "Invalid session metadata" });
      }

      const orderConfig = JSON.parse(session.metadata.orderConfig);
      const shippingInfo = JSON.parse(session.metadata.shippingInfo);
      const pricing = JSON.parse(session.metadata.serverPricing);

      let user = await storage.getUserByEmail(shippingInfo.email);
      if (!user) {
        user = await storage.createUser({
          email: shippingInfo.email,
          name: shippingInfo.name,
          phone: shippingInfo.shippingPhone || null,
          defaultAddress: shippingInfo.shippingAddress,
          defaultCity: shippingInfo.shippingCity,
          defaultState: shippingInfo.shippingState,
          defaultZip: shippingInfo.shippingZip,
        });
      }

      const totalTapes = Object.values(orderConfig.tapeFormats as Record<string, number>).reduce((sum: number, qty: number) => sum + qty, 0);

      const order = await storage.createOrder({
        userId: user.id,
        status: "pending",
        tapeFormats: orderConfig.tapeFormats as Record<TapeFormat, number>,
        totalTapes,
        estimatedHours: orderConfig.estimatedHours,
        outputFormats: orderConfig.outputFormats as OutputFormat[],
        dvdQuantity: orderConfig.dvdQuantity || 0,
        tapeHandling: orderConfig.tapeHandling,
        processingSpeed: orderConfig.processingSpeed,
        shippingName: shippingInfo.shippingName,
        shippingAddress: shippingInfo.shippingAddress,
        shippingCity: shippingInfo.shippingCity,
        shippingState: shippingInfo.shippingState,
        shippingZip: shippingInfo.shippingZip,
        shippingPhone: shippingInfo.shippingPhone || null,
        specialInstructions: orderConfig.specialInstructions || null,
        isGift: orderConfig.isGift || false,
        subtotal: pricing.subtotal.toString(),
        rushFee: pricing.rushFee.toString(),
        total: pricing.total.toString(),
        stripeSessionId: sessionId,
      });

      res.json({ order, session });
    } catch (error: any) {
      console.error("Verify and create order error:", error);
      res.status(500).json({ error: error.message || "Failed to verify payment and create order" });
    }
  });

  app.get("/api/orders", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check ownership or admin
      const authUser = req.user as any;
      if (order.userId !== authUser.id) {
        const dbUser = await storage.getUser(authUser.id);
        if (!dbUser?.isAdmin) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/number/:orderNumber", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check ownership or admin
      const authUser = req.user as any;
      if (order.userId !== authUser.claims.sub) {
        const dbUser = await storage.getUser(authUser.claims.sub);
        if (!dbUser?.isAdmin) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/user/:userId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Users can only view their own orders
      const authUser = req.user as any;
      if (authUser.id !== req.params.userId) {
        const dbUser = await storage.getUser(authUser.id);
        if (!dbUser?.isAdmin) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const orders = await storage.getOrdersByUserId(req.params.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id", ensureAdmin, async (req: Request, res: Response) => {
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

  app.delete("/api/orders/:id", ensureAdmin, async (req: Request, res: Response) => {
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

  app.get("/api/orders/:orderId/notes", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const notes = await storage.getOrderNotes(req.params.orderId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/orders/:orderId/notes", ensureAdmin, async (req: Request, res: Response) => {
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

  app.get("/api/admin/stats", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ============ ADMIN PRICING ROUTES ============

  app.get("/api/admin/pricing", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const configs = await storage.getPricingConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pricing configs" });
    }
  });

  app.patch("/api/admin/pricing/:key", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const { value } = req.body;
      if (value === undefined) {
        return res.status(400).json({ error: "Value is required" });
      }
      const config = await storage.updatePricingConfig(req.params.key, value.toString());
      if (!config) {
        return res.status(404).json({ error: "Pricing config not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update pricing config" });
    }
  });

  // ============ ADMIN AVAILABILITY ROUTES ============

  app.get("/api/admin/availability", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const availability = await storage.getProductAvailability();
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product availability" });
    }
  });

  app.patch("/api/admin/availability/:name", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const { isActive } = req.body;
      if (isActive === undefined) {
        return res.status(400).json({ error: "isActive is required" });
      }
      const availability = await storage.updateProductAvailability(req.params.name, isActive);
      if (!availability) {
        return res.status(404).json({ error: "Availability record not found" });
      }
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product availability" });
    }
  });

  // ============ PRICING CALCULATOR ============

  app.post("/api/pricing/calculate", async (req: Request, res: Response) => {
    try {
      const parsed = orderConfigSchema.parse(req.body);
      const pricing = await calculatePricing(parsed);
      res.json(pricing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to calculate pricing" });
    }
  });

  // ============ PUBLIC PRICING ROUTES ============

  app.get("/api/pricing", async (req: Request, res: Response) => {
    try {
      const configs = await storage.getPricingConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pricing configs" });
    }
  });

  return httpServer;
}
