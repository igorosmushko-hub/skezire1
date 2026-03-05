import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const KIE_API_BASE = 'https://api.kie.ai/api/v1/jobs';
const STORAGE_BUCKET = 'ai-uploads';
const FREE_LIMIT = 3;

/** Upload base64 data URI to Supabase Storage and return a public URL. */
async function uploadToStorage(base64DataUri: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // Ensure bucket exists (idempotent)
  await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });

  // Parse data URI
  const match = base64DataUri.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 data URI');

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, buffer, { contentType: `image/${match[1]}`, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  // Auth check
  const sessionUser = getSessionUser(req);
  if (!sessionUser) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.KIE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'config', message: 'KIE_AI_API_KEY not configured' },
      { status: 500 },
    );
  }

  // Check free usage limit per user
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('usage_count')
    .eq('id', sessionUser.userId)
    .single();

  const usageCount = userData?.usage_count ?? 0;
  if (usageCount >= FREE_LIMIT) {
    return NextResponse.json(
      { error: 'limit_reached', usage_count: usageCount, limit: FREE_LIMIT },
      { status: 403 },
    );
  }

  let body: { imageBase64?: string; gender?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { imageBase64, gender, type } = body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  if (imageBase64.length > 7_000_000) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 400 });
  }

  // Upload image to Supabase Storage to get a public URL for Kie AI
  let imageUrl: string;
  try {
    imageUrl = await uploadToStorage(imageBase64);
  } catch (err) {
    console.error('Image upload error:', err);
    return NextResponse.json({ error: 'upload_error' }, { status: 500 });
  }

  const genderWord = gender === 'female' ? 'woman' : 'man';

  let prompt: string;

  if (type === 'ancestor') {
    prompt = `Transform this person's photo into a portrait of a young Kazakh ${genderWord} ancestor, age 20-25, with dark thick hair and bright eyes, wearing traditional Kazakh embroidered chapan costume. Place them against a steppe landscape background with natural warm sunlight. Keep facial features recognizable. Highly detailed portrait photograph, masterpiece quality.`;
  } else if (type === 'action-figure') {
    prompt = `Turn this person into a highly detailed collectible action figure inside a sealed blister packaging box. The figure wears traditional Kazakh national costume: shapan and tymak hat. Include miniature accessories: dombyra, sword, and eagle. Product photography on white background with dramatic studio lighting. Toy packaging design, masterpiece quality.`;
  } else if (type === 'pet-humanize') {
    prompt = `Create a realistic portrait of a human version of this animal. Anthropomorphize it as a Kazakh ${genderWord} wearing traditional embroidered chapan. The human face should be inspired by the animal's features and expression. Professional studio portrait with warm lighting, highly detailed, masterpiece quality.`;
  } else if (type === 'ghibli') {
    prompt = `Transform this photo into a Studio Ghibli anime style illustration. Soft watercolor painting technique with gentle pastel colors. Place the character in a Kazakh steppe landscape background with yurts and wild horses. Warm dreamy golden hour lighting, Hayao Miyazaki art style, whimsical hand-drawn animation feel, masterpiece quality.`;
  } else {
    prompt = `Transform this person's photo into a vintage 1920s portrait photograph of a Kazakh ${genderWord}. They should wear a traditional shapan coat and tymak fur hat. Great steppe of Kazakhstan background. Apply sepia tones, aged daguerreotype film grain, warm golden lighting. Historical photograph aesthetic, masterpiece quality.`;
  }

  try {
    const res = await fetch(`${KIE_API_BASE}/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      console.error('Kie AI create error:', data);
      return NextResponse.json({ error: 'api_error' }, { status: 502 });
    }

    // Increment usage count
    await supabase
      .from('users')
      .update({ usage_count: usageCount + 1 })
      .eq('id', sessionUser.userId);

    const remaining = FREE_LIMIT - usageCount - 1;
    return NextResponse.json({ id: data.data.taskId, status: 'starting', remaining });
  } catch (err) {
    console.error('Kie AI create error:', err);
    return NextResponse.json({ error: 'api_error' }, { status: 502 });
  }
}
