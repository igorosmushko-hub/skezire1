import { NextRequest, NextResponse } from 'next/server';
import { isBotConfigured, sendMessage, getAdminChatId } from '@/lib/telegram-bot';

export async function POST(req: NextRequest) {
  if (!isBotConfigured()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const body = await req.json();
  const name = (body.name ?? '').trim().slice(0, 100);
  const contact = (body.contact ?? '').trim().slice(0, 100);
  const message = (body.message ?? '').trim().slice(0, 2000);

  if (!message) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 });
  }

  const text = [
    '💬 <b>Новое сообщение с сайта</b>',
    '',
    name ? `👤 ${name}` : '',
    contact ? `📱 ${contact}` : '',
    '',
    message,
  ].filter(Boolean).join('\n');

  await sendMessage({ chatId: getAdminChatId(), text });

  return NextResponse.json({ ok: true });
}
