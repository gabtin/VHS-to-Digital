-- Add order_messages table for customer-admin communication
CREATE TABLE IF NOT EXISTS "order_messages" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" varchar NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "message" text NOT NULL,
  "is_admin_message" boolean DEFAULT false NOT NULL,
  "email_sent" boolean DEFAULT false,
  "email_sent_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "order_messages_order_id_idx" ON "order_messages"("order_id");
CREATE INDEX IF NOT EXISTS "order_messages_user_id_idx" ON "order_messages"("user_id");
CREATE INDEX IF NOT EXISTS "order_messages_created_at_idx" ON "order_messages"("created_at" DESC);
