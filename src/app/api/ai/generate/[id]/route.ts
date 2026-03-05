import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

const KIE_API_BASE = 'https://api.kie.ai/api/v1/jobs';

// Map Kie AI states to Replicate-compatible statuses for the client
const STATE_MAP: Record<string, string> = {
  waiting: 'starting',
  queuing: 'starting',
  generating: 'processing',
  success: 'succeeded',
  fail: 'failed',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessionUser = getSessionUser(_req);
  if (!sessionUser) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.KIE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'config' }, { status: 500 });
  }

  const { id } = await params;

  try {
    const res = await fetch(
      `${KIE_API_BASE}/recordInfo?taskId=${encodeURIComponent(id)}`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      },
    );

    const data = await res.json();

    if (data.code !== 200 || !data.data) {
      console.error('Kie AI poll error:', data);
      return NextResponse.json({ error: 'api_error' }, { status: 502 });
    }

    const task = data.data;
    const status = STATE_MAP[task.state] ?? task.state;

    // Parse result URLs from resultJson
    let output: string[] | null = null;
    if (task.state === 'success' && task.resultJson) {
      try {
        const result = typeof task.resultJson === 'string'
          ? JSON.parse(task.resultJson)
          : task.resultJson;
        // Kie AI returns resultUrls array
        output = result.resultUrls ?? result.result_urls ?? result.images ?? [result.url].filter(Boolean);
      } catch {
        console.error('Failed to parse resultJson:', task.resultJson);
      }
    }

    return NextResponse.json({
      id: task.taskId,
      status,
      output,
      error: task.state === 'fail' ? (task.failMsg || 'Generation failed') : undefined,
    });
  } catch (err) {
    console.error('Kie AI poll error:', err);
    return NextResponse.json({ error: 'api_error' }, { status: 502 });
  }
}
