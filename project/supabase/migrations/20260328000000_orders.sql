-- Orders table for tracking order status
-- Supports both Square-integrated and manually created orders

-- update_updated_at function (may already exist from other migrations)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  square_order_id text UNIQUE,
  square_payment_id text,
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  items_json jsonb,
  total_amount integer,         -- in cents (e.g. 1099 = $10.99)
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'preparing', 'ready', 'picked_up', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup by order number (customer-facing)
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON orders (order_number);

-- Index for filtering active orders by status (staff dashboard)
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

-- Index for time-ranged queries (today's orders)
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at);

-- Auto-update updated_at on changes
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can read orders (customers look up by order number)
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT USING (true);

-- Only authenticated users (staff) can create orders
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (true);

-- Only authenticated users (staff) can update order status
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE TO authenticated USING (true);
