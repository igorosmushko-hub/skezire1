import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || token === 'r8_YOUR_TOKEN_HERE') {
    return NextResponse.json({ error: 'config' }, { status: 500 });
  }

  const { id } = await params;

  try {
    const replicate = new Replicate({ auth: token });
    const prediction = await replicate.predictions.get(id);

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    });
  } catch (err) {
    console.error('Replicate poll error:', err);
    return NextResponse.json({ error: 'api_error' }, { status: 502 });
  }
}
