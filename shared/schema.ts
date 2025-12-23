import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for customer authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  defaultAddress: text("default_address"),
  defaultCity: text("default_city"),
  defaultState: text("default_state"),
  defaultZip: text("default_zip"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tape format enum values
export const tapeFormats = ["vhs", "vhsc", "hi8", "minidv", "betamax"] as const;
export type TapeFormat = typeof tapeFormats[number];

// Output format enum values  
export const outputFormats = ["mp4", "usb", "dvd", "cloud"] as const;
export type OutputFormat = typeof outputFormats[number];

// Tape handling enum values
export const tapeHandlingOptions = ["return", "dispose"] as const;
export type TapeHandling = typeof tapeHandlingOptions[number];

// Processing speed enum values
export const processingSpeedOptions = ["standard", "rush"] as const;
export type ProcessingSpeed = typeof processingSpeedOptions[number];

// Order status enum values
export const orderStatuses = [
  "pending",
  "label_sent", 
  "tapes_received",
  "in_progress",
  "quality_check",
  "ready_for_download",
  "shipped",
  "complete",
  "cancelled"
] as const;
export type OrderStatus = typeof orderStatuses[number];

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  
  // Tape details
  tapeFormats: jsonb("tape_formats").$type<Record<TapeFormat, number>>().notNull(),
  totalTapes: integer("total_tapes").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  
  // Output options
  outputFormats: text("output_formats").array().notNull(),
  dvdQuantity: integer("dvd_quantity").default(0),
  
  // Handling and processing
  tapeHandling: text("tape_handling").notNull(),
  processingSpeed: text("processing_speed").notNull().default("standard"),
  
  // Shipping info
  shippingName: text("shipping_name").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  shippingPhone: text("shipping_phone"),
  
  // Special instructions
  specialInstructions: text("special_instructions"),
  isGift: boolean("is_gift").default(false),
  
  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  rushFee: decimal("rush_fee", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  // Tracking
  trackingNumber: text("tracking_number"),
  downloadUrl: text("download_url"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
});

// Admin notes on orders
export const orderNotes = pgTable("order_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  note: text("note").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  notes: many(orderNotes),
}));

export const orderNotesRelations = relations(orderNotes, ({ one }) => ({
  order: one(orders, {
    fields: [orderNotes.orderId],
    references: [orders.id],
  }),
  createdByUser: one(users, {
    fields: [orderNotes.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderNoteSchema = createInsertSchema(orderNotes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderNote = z.infer<typeof insertOrderNoteSchema>;
export type OrderNote = typeof orderNotes.$inferSelect;

// Order configuration type for the wizard
export const orderConfigSchema = z.object({
  tapeFormats: z.record(z.enum(tapeFormats), z.number().min(0)).default({}),
  totalTapes: z.number().min(1),
  estimatedHours: z.number().min(1),
  outputFormats: z.array(z.enum(outputFormats)).min(1),
  dvdQuantity: z.number().min(0).optional(),
  tapeHandling: z.enum(tapeHandlingOptions),
  processingSpeed: z.enum(processingSpeedOptions),
  specialInstructions: z.string().optional(),
  isGift: z.boolean().optional(),
});

export type OrderConfig = z.infer<typeof orderConfigSchema>;

// Pricing constants
export const PRICING = {
  basePricePerTape: 25,
  pricePerHour: 10,
  usbDrive: 15,
  dvdPerDisc: 8,
  cloudStorage: 10,
  returnShipping: 5,
  rushMultiplier: 0.5,
} as const;
