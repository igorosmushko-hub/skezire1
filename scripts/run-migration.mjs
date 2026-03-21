// One-time migration script: adds paid_generations column and creates monetization tables
// Usage: node scripts/run-migration.mjs
// Requires: SUPABASE_DB_URL env var or uses default pooler connection

import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.SUPABASE_DB_URL
  || 'postgresql://postgres.ifwgscdmijexjijeihwo:YOUR_DB_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

if (DATABASE_URL.includes('YOUR_DB_PASSWORD')) {
  console.error('Set SUPABASE_DB_URL or replace YOUR_DB_PASSWORD in the script.');
  console.error('Find it in: Supabase Dashboard -> Settings -> Database -> Connection string');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });
await client.connect();

const migration = `
-- 1. Add paid_generations to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS paid_generations INT DEFAULT 0;

-- 2. AI generation packages
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_kk TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  generations INT NOT NULL,
  price_kzt INT NOT NULL,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO packages (slug, name_kk, name_ru, generations, price_kzt, sort_order) VALUES
  ('starter',  'Стартер',  'Стартер',  5,  990, 1),
  ('standard', 'Стандарт', 'Стандарт', 15, 1990, 2),
  ('premium',  'Премиум',  'Премиум',  50, 4990, 3)
ON CONFLICT (slug) DO NOTHING;

-- 3. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  package_id UUID NOT NULL REFERENCES packages(id),
  amount_kzt INT NOT NULL,
  inv_id SERIAL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_inv ON payments(inv_id);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  name_kk TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  price_kzt INT NOT NULL,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO products (type, size, name_kk, name_ru, price_kzt, sort_order) VALUES
  ('poster',        'A3',    'Постер A3',              'Постер A3',              3990,  1),
  ('canvas',        '30x40', 'Холст 30x40 см',        'Холст 30×40 см',        7990,  2),
  ('canvas',        '50x70', 'Холст 50x70 см',        'Холст 50×70 см',        12990, 3),
  ('canvas_framed', '30x40', 'Холст рамкамен 30x40',  'Холст в рамке 30×40',   11990, 4),
  ('canvas_framed', '50x70', 'Холст рамкамен 50x70',  'Холст в рамке 50×70',   17990, 5)
ON CONFLICT DO NOTHING;

-- 5. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  image_url TEXT NOT NULL,
  image_stored TEXT,
  ai_type TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT,
  amount_kzt INT NOT NULL,
  delivery_cost INT DEFAULT 0,
  inv_id INT UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'new',
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

-- 7. Function: atomically increment paid_generations
CREATE OR REPLACE FUNCTION increment_paid_generations(p_user_id uuid, p_amount int)
RETURNS void AS $$
  UPDATE users SET paid_generations = paid_generations + p_amount WHERE id = p_user_id;
$$ LANGUAGE sql;
`;

// Split by statement and run each
const statements = migration
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

for (const stmt of statements) {
  try {
    await client.query(stmt);
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 60);
    console.log(`OK: ${preview}...`);
  } catch (err) {
    console.error(`ERR: ${stmt.slice(0, 60)}...`);
    console.error(`     ${err.message}`);
  }
}

await client.end();
console.log('\nMigration complete!');
