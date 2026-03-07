-- ============================================================
-- Skezire Monetization: tables for payments, orders, products
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add paid_generations to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS paid_generations INT DEFAULT 0;

-- 2. AI generation packages
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,        -- 'starter', 'standard', 'premium'
  name_kk TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  generations INT NOT NULL,          -- 5, 15, 50
  price_kzt INT NOT NULL,            -- 990, 1990, 4990
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed packages
INSERT INTO packages (slug, name_kk, name_ru, generations, price_kzt, sort_order) VALUES
  ('starter',  'Стартер',  'Стартер',  5,  990, 1),
  ('standard', 'Стандарт', 'Стандарт', 15, 1990, 2),
  ('premium',  'Премиум',  'Премиум',  50, 4990, 3)
ON CONFLICT (slug) DO NOTHING;

-- 3. Payments (for AI generation packages)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  package_id UUID NOT NULL REFERENCES packages(id),
  amount_kzt INT NOT NULL,
  inv_id SERIAL,                     -- auto-increment invoice ID for RoboCassa
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_inv ON payments(inv_id);

-- 4. Products (canvas prints catalog)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,                -- 'poster', 'canvas', 'canvas_framed'
  size TEXT NOT NULL,                -- '30x40', '50x70', 'A3'
  name_kk TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  price_kzt INT NOT NULL,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed products (prices TBD — placeholders)
INSERT INTO products (type, size, name_kk, name_ru, price_kzt, sort_order) VALUES
  ('poster',        'A3',    'Постер A3',              'Постер A3',              3990,  1),
  ('canvas',        '30x40', 'Холст 30x40 см',        'Холст 30×40 см',        7990,  2),
  ('canvas',        '50x70', 'Холст 50x70 см',        'Холст 50×70 см',        12990, 3),
  ('canvas_framed', '30x40', 'Холст рамкамен 30x40',  'Холст в рамке 30×40',   11990, 4),
  ('canvas_framed', '50x70', 'Холст рамкамен 50x70',  'Холст в рамке 50×70',   17990, 5)
ON CONFLICT DO NOTHING;

-- 5. Orders (canvas print orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,               -- human-readable: 1001, 1002...
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Image
  image_url TEXT NOT NULL,            -- original AI result URL
  image_stored TEXT,                  -- path in Supabase Storage (backup)
  ai_type TEXT,                       -- 'past', 'ancestor', 'action-figure'...

  -- Delivery
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT,

  -- Payment
  amount_kzt INT NOT NULL,            -- product + delivery
  delivery_cost INT DEFAULT 0,
  inv_id INT UNIQUE,                  -- RoboCassa invoice ID
  payment_status TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | refunded

  -- Order status
  status TEXT NOT NULL DEFAULT 'new',
  -- new → paid → in_production → shipped → delivered → cancelled

  tracking_number TEXT,
  tracking_url TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_inv ON orders(inv_id);

-- 6. Order status log
CREATE TABLE IF NOT EXISTS order_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_log_order ON order_status_log(order_id);

-- Set order_number to start from 1001
SELECT setval(pg_get_serial_sequence('orders', 'order_number'), 1000, false);

-- Function: atomically increment paid_generations
CREATE OR REPLACE FUNCTION increment_paid_generations(p_user_id uuid, p_amount int)
RETURNS void AS $$
  UPDATE users SET paid_generations = paid_generations + p_amount WHERE id = p_user_id;
$$ LANGUAGE sql;
