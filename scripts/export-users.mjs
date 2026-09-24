// Export all registered user phones from Supabase
// Usage: node scripts/export-users.mjs
// Output: users-export.csv in project root

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

// Parse .env.local
const envFile = readFileSync('.env.local', 'utf-8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data, error } = await supabase
  .from('users')
  .select('id, phone, first_name, last_name, tribe_id, usage_count, paid_generations, created_at')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.log('Пользователей пока нет.');
  process.exit(0);
}

// CSV
const header = 'phone,first_name,last_name,tribe_id,usage_count,paid_generations,created_at';
const rows = data.map((u) =>
  [u.phone, u.first_name ?? '', u.last_name ?? '', u.tribe_id ?? '', u.usage_count, u.paid_generations, u.created_at].join(',')
);
const csv = [header, ...rows].join('\n');

writeFileSync('users-export.csv', csv, 'utf-8');
console.log(`Выгружено ${data.length} пользователей → users-export.csv`);
