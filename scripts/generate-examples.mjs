#!/usr/bin/env node

/**
 * One-time script: generate AI example images for landing pages.
 *
 * Usage:
 *   node scripts/generate-examples.mjs
 *
 * Requires .env.local with KIE_AI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Load .env.local ──────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  const text = fs.readFileSync(envPath, 'utf-8');
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const KIE_API_KEY = process.env.KIE_AI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!KIE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = 'ai-uploads';
const KIE_BASE = 'https://api.kie.ai/api/v1/jobs';
const STOCK_DIR = path.join(__dirname, 'stock-photos');
const OUT_DIR = path.join(ROOT, 'public', 'ai-examples');

fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Prompts (copied from route.ts lines 96-106) ─────────────────
const prompts = {
  past: (g) =>
    `Transform this person's photo into a vintage 1920s portrait photograph of a Kazakh ${g}. They should wear a traditional shapan coat and tymak fur hat. Great steppe of Kazakhstan background. Apply sepia tones, aged daguerreotype film grain, warm golden lighting. Historical photograph aesthetic, masterpiece quality.`,
  ancestor: (g) =>
    `Transform this person's photo into a portrait of a young Kazakh ${g} ancestor, age 20-25, with dark thick hair and bright eyes, wearing traditional Kazakh embroidered chapan costume. Place them against a steppe landscape background with natural warm sunlight. Keep facial features recognizable. Highly detailed portrait photograph, masterpiece quality.`,
  'action-figure': (_g) =>
    `Turn this person into a highly detailed collectible action figure inside a sealed blister packaging box. The figure wears traditional Kazakh national costume: shapan and tymak hat. Include miniature accessories: dombyra, sword, and eagle. Product photography on white background with dramatic studio lighting. Toy packaging design, masterpiece quality.`,
  'pet-humanize': (g) =>
    `Create a realistic portrait of a human version of this animal. Anthropomorphize it as a Kazakh ${g} wearing traditional embroidered chapan. The human face should be inspired by the animal's features and expression. Professional studio portrait with warm lighting, highly detailed, masterpiece quality.`,
  'ghibli-style': (_g) =>
    `Transform this photo into a Studio Ghibli anime style illustration. Soft watercolor painting technique with gentle pastel colors. Place the character in a Kazakh steppe landscape background with yurts and wild horses. Warm dreamy golden hour lighting, Hayao Miyazaki art style, whimsical hand-drawn animation feel, masterpiece quality.`,
};

// ── Jobs to run ──────────────────────────────────────────────────
const jobs = [
  // past (vintage)
  { slug: 'past', n: 1, photo: 'woman.jpg', gender: 'woman' },
  { slug: 'past', n: 2, photo: 'man.jpg', gender: 'man' },
  { slug: 'past', n: 3, photo: 'person3.jpg', gender: 'man' },
  // ancestor
  { slug: 'ancestor', n: 1, photo: 'woman.jpg', gender: 'woman' },
  { slug: 'ancestor', n: 2, photo: 'man.jpg', gender: 'man' },
  { slug: 'ancestor', n: 3, photo: 'person3.jpg', gender: 'man' },
  // action-figure
  { slug: 'action-figure', n: 1, photo: 'woman.jpg', gender: 'woman' },
  { slug: 'action-figure', n: 2, photo: 'man.jpg', gender: 'man' },
  { slug: 'action-figure', n: 3, photo: 'person3.jpg', gender: 'man' },
  // pet-humanize
  { slug: 'pet-humanize', n: 1, photo: 'cat.jpg', gender: 'man' },
  { slug: 'pet-humanize', n: 2, photo: 'dog.jpg', gender: 'man' },
  { slug: 'pet-humanize', n: 3, photo: 'horse.jpg', gender: 'woman' },
  // ghibli-style
  { slug: 'ghibli-style', n: 1, photo: 'woman.jpg', gender: 'woman' },
  { slug: 'ghibli-style', n: 2, photo: 'man.jpg', gender: 'man' },
  { slug: 'ghibli-style', n: 3, photo: 'person3.jpg', gender: 'man' },
];

// ── Upload photo to Supabase ─────────────────────────────────────
async function uploadPhoto(filename) {
  const filePath = path.join(STOCK_DIR, filename);
  const buffer = fs.readFileSync(filePath);
  const storageName = `examples-${Date.now()}-${filename}`;

  // Ensure bucket exists
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageName, buffer, { contentType: 'image/jpeg', upsert: false });

  if (error) throw new Error(`Upload ${filename}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storageName);
  return data.publicUrl;
}

// ── Create task on Kie AI ────────────────────────────────────────
async function createTask(prompt, imageUrl) {
  const res = await fetch(`${KIE_BASE}/createTask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nano-banana-2',
      input: {
        prompt,
        image_input: [imageUrl],
        aspect_ratio: '3:4',
        resolution: '2K',
        output_format: 'jpg',
        google_search: false,
      },
    }),
  });

  const data = await res.json();
  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error(`createTask failed: ${JSON.stringify(data)}`);
  }
  return data.data.taskId;
}

// ── Poll for result ──────────────────────────────────────────────
async function pollTask(taskId, maxWait = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 3000));

    const res = await fetch(
      `${KIE_BASE}/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { Authorization: `Bearer ${KIE_API_KEY}` } },
    );
    const data = await res.json();

    if (data.code !== 200 || !data.data) {
      console.warn(`  poll warning:`, data);
      continue;
    }

    const task = data.data;
    if (task.state === 'success') {
      const result =
        typeof task.resultJson === 'string'
          ? JSON.parse(task.resultJson)
          : task.resultJson;
      const urls =
        result.resultUrls ?? result.result_urls ?? result.images ?? [result.url].filter(Boolean);
      return urls[0];
    }
    if (task.state === 'fail') {
      throw new Error(`Task ${taskId} failed: ${task.failMsg || 'unknown'}`);
    }
    process.stdout.write('.');
  }
  throw new Error(`Task ${taskId} timed out`);
}

// ── Download & optimize to WebP ──────────────────────────────────
async function downloadAndOptimize(url, outName) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const outPath = path.join(OUT_DIR, outName);
  await sharp(buffer).resize(800, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(outPath);

  const stats = fs.statSync(outPath);
  return stats.size;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log(`Starting ${jobs.length} generations...\n`);

  // Upload all unique photos first
  const photoUrls = new Map();
  const uniquePhotos = [...new Set(jobs.map((j) => j.photo))];

  for (const photo of uniquePhotos) {
    process.stdout.write(`Uploading ${photo}... `);
    const url = await uploadPhoto(photo);
    photoUrls.set(photo, url);
    console.log('OK');
  }

  console.log('');

  // Process jobs (3 concurrent to not overwhelm the API)
  const CONCURRENCY = 3;
  let idx = 0;
  const results = new Array(jobs.length);

  async function processJob(i) {
    const job = jobs[i];
    const outName = `${job.slug}-${job.n}.webp`;
    const outPath = path.join(OUT_DIR, outName);

    // Skip if already exists
    if (fs.existsSync(outPath)) {
      console.log(`[${i + 1}/${jobs.length}] ${outName} — already exists, skipping`);
      results[i] = { name: outName, status: 'skipped' };
      return;
    }

    const imageUrl = photoUrls.get(job.photo);
    const prompt = prompts[job.slug](job.gender);

    process.stdout.write(`[${i + 1}/${jobs.length}] ${outName} — creating task`);

    try {
      const taskId = await createTask(prompt, imageUrl);
      process.stdout.write(` (${taskId}) polling`);

      const resultUrl = await pollTask(taskId);
      process.stdout.write(' downloading');

      const size = await downloadAndOptimize(resultUrl, outName);
      console.log(` — OK (${(size / 1024).toFixed(0)}KB)`);
      results[i] = { name: outName, status: 'ok', size };
    } catch (err) {
      console.log(` — FAIL: ${err.message}`);
      results[i] = { name: outName, status: 'failed', error: err.message };
    }
  }

  // Run with concurrency
  async function worker() {
    while (idx < jobs.length) {
      const i = idx++;
      await processJob(i);
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, () => worker());
  await Promise.all(workers);

  // Summary
  console.log('\n=== SUMMARY ===');
  const ok = results.filter((r) => r?.status === 'ok').length;
  const skipped = results.filter((r) => r?.status === 'skipped').length;
  const failed = results.filter((r) => r?.status === 'failed').length;
  console.log(`OK: ${ok}, Skipped: ${skipped}, Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed jobs:');
    results.filter((r) => r?.status === 'failed').forEach((r) => console.log(`  ${r.name}: ${r.error}`));
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
