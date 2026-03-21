// Seed fake member counts into tribe_stats for social proof
// Usage: node scripts/seed-tribe-stats.mjs
//
// Distributes ~987 fake members across tribes realistically
// Uses Supabase REST API (no pg driver needed)

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local manually
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

// Tribe -> base weight (higher = more members)
const TRIBE_WEIGHTS = {
  // Uly zhuz
  dulat: 55, jalayir: 40, alban: 38, suan: 32, shapyrashty: 25,
  ysty: 22, oshakty: 18, sirgeli: 16, kanly: 20, shanishkily: 12,
  janyis: 10, katagan: 9,
  // Orta zhuz — strongest
  argyn: 78, naiman: 72, kypshak: 48, kerey: 52, konyrat: 42,
  uak: 28, tarakty: 15, merkit: 12,
  // Kishi zhuz — many smaller tribes
  aday: 35, bersh: 22, tabyn: 18, tama: 16, zhagalbayly: 14,
  shomekei: 20, shekti: 18, karakesek: 15, baybakty: 12, zhappas: 10,
  alasha: 8, esentemir: 7, maskar: 6, tana: 7, taz: 5,
  sherkesh: 9, ysyk: 6, kyzylkurt: 5, kerderi: 8, teleu: 7,
  ramadan: 5, tileu: 4, kete: 6, karatay: 5,
  // Other
  tore: 14, koja: 10, tolengit: 8,
};

function randomize(base) {
  const factor = 0.8 + Math.random() * 0.4;
  return Math.max(1, Math.round(base * factor));
}

// First, get current stats
const { data: currentStats } = await supabase
  .from('tribe_stats')
  .select('tribe_id, member_count');

const currentMap = {};
for (const s of currentStats ?? []) {
  currentMap[s.tribe_id] = s.member_count ?? 0;
}

let total = 0;

for (const [tribeId, weight] of Object.entries(TRIBE_WEIGHTS)) {
  const count = randomize(weight);
  const todayCount = Math.random() < 0.4 ? Math.floor(Math.random() * 5) + 1 : 0;
  const newTotal = (currentMap[tribeId] ?? 0) + count;
  total += count;

  const { error } = await supabase
    .from('tribe_stats')
    .update({
      member_count: newTotal,
      today_count: todayCount,
      today_date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq('tribe_id', tribeId);

  if (error) {
    console.error(`  ERR ${tribeId}: ${error.message}`);
  } else {
    console.log(`  ${tribeId}: ${currentMap[tribeId] ?? 0} → ${newTotal}${todayCount > 0 ? ` (today: +${todayCount})` : ''}`);
  }
}

console.log(`\nTotal seeded: +${total} fake members across ${Object.keys(TRIBE_WEIGHTS).length} tribes`);
console.log('Done!');
