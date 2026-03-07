const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID ?? '';
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export function isBotConfigured(): boolean {
  return !!BOT_TOKEN && !!ADMIN_CHAT_ID;
}

export function getAdminChatId(): string {
  return ADMIN_CHAT_ID;
}

interface SendMessageOptions {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  replyMarkup?: object;
}

export async function sendMessage({ chatId, text, parseMode = 'HTML', replyMarkup }: SendMessageOptions) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await fetch(`${API_BASE}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

export async function editMessageReplyMarkup(chatId: string, messageId: number, replyMarkup?: object) {
  await fetch(`${API_BASE}/editMessageReplyMarkup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup ?? { inline_keyboard: [] },
    }),
  });
}

/**
 * Send new order notification to admin with inline action buttons.
 */
export async function notifyNewOrder(order: {
  id: string;
  order_number: number;
  product_name: string;
  product_size: string;
  amount_kzt: number;
  recipient_name: string;
  recipient_phone: string;
  city: string;
  address: string;
  postal_code?: string;
  image_url: string;
  ai_type?: string;
}) {
  const text = [
    `🆕 <b>Новый заказ #${order.order_number}</b>`,
    '',
    `📦 ${order.product_name} (${order.product_size})`,
    `💰 ${order.amount_kzt.toLocaleString()} ₸`,
    '',
    `👤 ${order.recipient_name}`,
    `📱 ${order.recipient_phone}`,
    `📍 ${order.city}, ${order.address}${order.postal_code ? `, ${order.postal_code}` : ''}`,
    '',
    `🖼 <a href="${order.image_url}">Скачать изображение</a>`,
    order.ai_type ? `🤖 Тип: ${order.ai_type}` : '',
  ].filter(Boolean).join('\n');

  const replyMarkup = {
    inline_keyboard: [
      [{ text: '✅ Взять в работу', callback_data: `status:${order.id}:in_production` }],
      [{ text: '📦 Отправлено', callback_data: `ship:${order.id}` }],
      [{ text: '✔️ Доставлено', callback_data: `status:${order.id}:delivered` }],
    ],
  };

  return sendMessage({ chatId: ADMIN_CHAT_ID, text, replyMarkup });
}

/**
 * Format order list for /orders command.
 */
export function formatOrdersList(orders: Array<{
  order_number: number;
  status: string;
  amount_kzt: number;
  recipient_name: string;
  created_at: string;
}>): string {
  if (!orders.length) return '📋 Нет активных заказов';

  const statusEmoji: Record<string, string> = {
    new: '🆕', paid: '💳', in_production: '🖨', shipped: '📦', delivered: '✅', cancelled: '❌',
  };

  const lines = orders.map((o) => {
    const emoji = statusEmoji[o.status] ?? '❓';
    const date = new Date(o.created_at).toLocaleDateString('ru-RU');
    return `${emoji} #${o.order_number} — ${o.recipient_name} — ${o.amount_kzt.toLocaleString()}₸ (${date})`;
  });

  return `📋 <b>Заказы (${orders.length})</b>\n\n${lines.join('\n')}`;
}
