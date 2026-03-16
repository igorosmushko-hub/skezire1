// Migration 003: Tribe race — adds tribe membership to users and creates tribe stats tables
// Usage: SUPABASE_DB_URL=... node scripts/run-migration-003-tribes.mjs

import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.SUPABASE_DB_URL
  || 'postgresql://postgres.ifwgscdmijexjijeihwo:YOUR_DB_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

if (DATABASE_URL.includes('YOUR_DB_PASSWORD')) {
  console.error('Set SUPABASE_DB_URL or replace YOUR_DB_PASSWORD in the script.');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });
await client.connect();

const migration = `
-- 1. Add tribe columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS zhuz_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tribe_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tribe_joined_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_tribe ON users(tribe_id) WHERE tribe_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_zhuz ON users(zhuz_id) WHERE zhuz_id IS NOT NULL;

-- 2. Tribe stats (counter cache)
CREATE TABLE IF NOT EXISTS tribe_stats (
  tribe_id TEXT PRIMARY KEY,
  zhuz_id TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  today_count INTEGER DEFAULT 0,
  today_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Daily activity log for growth charts
CREATE TABLE IF NOT EXISTS tribe_activity_log (
  id BIGSERIAL PRIMARY KEY,
  tribe_id TEXT NOT NULL,
  zhuz_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  new_members INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  UNIQUE(tribe_id, date)
);
CREATE INDEX IF NOT EXISTS idx_tribe_activity_date ON tribe_activity_log(date);

-- 4. Seed tribe_stats with all tribes
INSERT INTO tribe_stats (tribe_id, zhuz_id) VALUES
  ('dulat', 'uly'), ('jalayir', 'uly'), ('shapyrashty', 'uly'), ('ysty', 'uly'),
  ('oshakty', 'uly'), ('sirgeli', 'uly'), ('kanly', 'uly'), ('alban', 'uly'),
  ('suan', 'uly'), ('shanishkily', 'uly'), ('janyis', 'uly'), ('katagan', 'uly'),
  ('argyn', 'orta'), ('naiman', 'orta'), ('kerey', 'orta'), ('kypshak', 'orta'),
  ('uak', 'orta'), ('konyrat', 'orta'), ('tarakty', 'orta'), ('merkit', 'orta'),
  ('aday', 'kishi'), ('baybakty', 'kishi'), ('zhappas', 'kishi'), ('alasha', 'kishi'),
  ('bersh', 'kishi'), ('esentemir', 'kishi'), ('maskar', 'kishi'), ('tana', 'kishi'),
  ('taz', 'kishi'), ('sherkesh', 'kishi'), ('ysyk', 'kishi'), ('kyzylkurt', 'kishi'),
  ('tabyn', 'kishi'), ('tama', 'kishi'), ('zhagalbayly', 'kishi'), ('kerderi', 'kishi'),
  ('teleu', 'kishi'), ('ramadan', 'kishi'), ('tileu', 'kishi'),
  ('shomekei', 'kishi'), ('shekti', 'kishi'), ('karakesek', 'kishi'), ('karatay', 'kishi'), ('kete', 'kishi'),
  ('tore', 'other'), ('koja', 'other'), ('tolengit', 'other')
ON CONFLICT (tribe_id) DO NOTHING;

-- 5. Trigger function: update tribe_stats when user joins/changes tribe
CREATE OR REPLACE FUNCTION on_user_tribe_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement old tribe if changing
  IF OLD.tribe_id IS NOT NULL AND OLD.tribe_id IS DISTINCT FROM NEW.tribe_id THEN
    UPDATE tribe_stats SET member_count = GREATEST(0, member_count - 1), updated_at = NOW() WHERE tribe_id = OLD.tribe_id;
  END IF;

  -- Increment new tribe
  IF NEW.tribe_id IS NOT NULL AND (OLD.tribe_id IS NULL OR OLD.tribe_id IS DISTINCT FROM NEW.tribe_id) THEN
    UPDATE tribe_stats
    SET member_count = member_count + 1,
        today_count = CASE WHEN today_date = CURRENT_DATE THEN today_count + 1 ELSE 1 END,
        today_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE tribe_id = NEW.tribe_id;

    -- Upsert activity log
    INSERT INTO tribe_activity_log (tribe_id, zhuz_id, date, new_members)
    VALUES (NEW.tribe_id, NEW.zhuz_id, CURRENT_DATE, 1)
    ON CONFLICT (tribe_id, date) DO UPDATE SET new_members = tribe_activity_log.new_members + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger
DROP TRIGGER IF EXISTS trg_user_tribe_change ON users;
CREATE TRIGGER trg_user_tribe_change
  AFTER UPDATE OF tribe_id ON users
  FOR EACH ROW EXECUTE FUNCTION on_user_tribe_change();
`;

const statements = migration
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

for (const stmt of statements) {
  try {
    await client.query(stmt);
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
    console.log(`OK: ${preview}...`);
  } catch (err) {
    console.error(`ERR: ${stmt.slice(0, 80)}...`);
    console.error(`     ${err.message}`);
  }
}

await client.end();
console.log('\nMigration 003 (tribe race) complete!');
