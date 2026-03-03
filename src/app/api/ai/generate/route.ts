import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 3600_000; // 1 hour

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || token === 'r8_YOUR_TOKEN_HERE') {
    return NextResponse.json(
      { error: 'config', message: 'REPLICATE_API_TOKEN not configured' },
      { status: 500 },
    );
  }

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT) {
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
    }
    entry.count++;
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
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

  const genderWord = gender === 'female' ? 'woman' : 'man';

  let prompt: string;
  let negativePrompt: string;

  if (type === 'ancestor') {
    prompt = `a young kazakh ${genderWord} img, youthful smooth face, age 20-25, dark thick hair, bright eyes, wearing traditional kazakh national costume, embroidered chapan, steppe landscape background, natural warm sunlight, portrait photograph, highly detailed, masterpiece, best quality`;
    negativePrompt = 'old, elderly, wrinkles, gray hair, aged, modern clothing, smartphone, car, plastic, neon, blurry, low quality, deformed, ugly, bad anatomy, watermark, text, logo, cropped, out of frame';
  } else {
    prompt = `a kazakh ${genderWord} img, vintage 1920s portrait photograph, wearing traditional kazakh shapan coat and tymak fur hat, great steppe of Kazakhstan background, sepia tones, aged daguerreotype film grain, warm golden lighting, historical photograph, highly detailed, masterpiece, best quality`;
    negativePrompt = 'modern clothing, smartphone, car, plastic, neon, blurry, low quality, deformed, ugly, bad anatomy, watermark, text, logo, cropped, out of frame';
  }

  try {
    const replicate = new Replicate({ auth: token });

    const prediction = await replicate.predictions.create({
      version: 'ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4',
      input: {
        input_image: imageBase64,
        prompt,
        negative_prompt: negativePrompt,
        style_name: '(No style)',
        num_steps: 20,
        style_strength_ratio: 35,
        num_outputs: 1,
        guidance_scale: 5,
      },
    });

    return NextResponse.json({ id: prediction.id, status: prediction.status });
  } catch (err) {
    console.error('Replicate create error:', err);
    return NextResponse.json({ error: 'api_error' }, { status: 502 });
  }
}
