import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// List all buckets
const { data: buckets, error } = await supabase.storage.listBuckets();
if (error) {
  console.error('Error listing buckets:', error.message);
} else {
  console.log('Existing buckets:', buckets.map(b => b.name));
}

// Try to create order-images bucket if missing
const exists = buckets?.some(b => b.name === 'order-images');
if (!exists) {
  console.log('\nBucket "order-images" not found. Creating...');
  const { data, error: createErr } = await supabase.storage.createBucket('order-images', {
    public: false,
  });
  if (createErr) {
    console.error('Failed to create bucket:', createErr.message);
  } else {
    console.log('Bucket created successfully:', data);
  }
} else {
  console.log('\nBucket "order-images" exists.');
}
