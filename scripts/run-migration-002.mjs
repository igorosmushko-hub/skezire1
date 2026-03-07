// Migration 002: generations table + user name column
// Usage: SUPABASE_DB_URL="..." node scripts/run-migration-002.mjs

import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.SUPABASE_DB_URL
  || 'postgresql://postgres.ifwgscdmijexjijeihwo:YOUR_DB_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

if (DATABASE_URL.includes('YOUR_DB_PASSWORD')) {
  console.error('Set SUPABASE_DB_URL env var.');
  console.error('Find it in: Supabase Dashboard -> Settings -> Database -> Connection string');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });
await client.connect();

const migration = `
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  image_url TEXT,
  result_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  task_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at DESC);

ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
`;

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
console.log('\nMigration 002 complete!');
