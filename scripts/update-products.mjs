// Update products: new canvas sizes and prices (March 2026)
// Usage: node scripts/update-products.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

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

// Deactivate all current products
const { error: deactivateErr } = await supabase
  .from('products')
  .update({ active: false })
  .neq('id', '00000000-0000-0000-0000-000000000000'); // match all

if (deactivateErr) {
  console.error('Failed to deactivate old products:', deactivateErr.message);
  process.exit(1);
}
console.log('Old products deactivated.');

const products = [
  { size: '60×40 см', price_kzt: 8490, sort_order: 1 },
  { size: '50×70 см', price_kzt: 11990, sort_order: 2 },
  { size: '60×80 см', price_kzt: 16990, sort_order: 3 },
  { size: '60×90 см', price_kzt: 18490, sort_order: 4 },
  { size: '100×70 см', price_kzt: 20990, sort_order: 5 },
  { size: '100×80 см', price_kzt: 22490, sort_order: 6 },
  { size: '120×80 см', price_kzt: 24990, sort_order: 7 },
  { size: '120×100 см', price_kzt: 28990, sort_order: 8 },
  { size: '150×100 см', price_kzt: 37990, sort_order: 9 },
  { size: '170×120 см', price_kzt: 40490, sort_order: 10 },
  { size: '200×100 см', price_kzt: 44490, sort_order: 11 },
];

const rows = products.map((p) => ({
  type: 'canvas',
  size: p.size,
  name_kk: `Кенепке басу ${p.size}`,
  name_ru: `Картина на холсте ${p.size}`,
  price_kzt: p.price_kzt,
  active: true,
  sort_order: p.sort_order,
}));

const { data, error } = await supabase.from('products').insert(rows).select('id, size, price_kzt');

if (error) {
  console.error('Failed to insert products:', error.message);
  process.exit(1);
}

console.log(`\nДобавлено ${data.length} товаров:\n`);
for (const p of data) {
  console.log(`  ${p.size} — ${p.price_kzt.toLocaleString()} ₸`);
}
