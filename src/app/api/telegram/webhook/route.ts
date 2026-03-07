import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import {
  isBotConfigured,
  getAdminChatId,
  sendMessage,
  answerCallbackQuery,
  editMessageReplyMarkup,
  formatOrdersList,
} from '@/lib/telegram-bot';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  if (!isBotConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  // Optional: verify webhook secret via query param
  if (WEBHOOK_SECRET) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  const body = await req.json();
  const adminChatId = getAdminChatId();
  const supabase = getSupabase();

  // Handle callback queries (inline button presses)
  if (body.callback_query) {
    const cb = body.callback_query;
    const chatId = String(cb.message?.chat?.id);
    const messageId = cb.message?.message_id;
    const data = cb.data as string;

    if (chatId !== adminChatId) {
      await answerCallbackQuery(cb.id, 'Доступ запрещён');
      return NextResponse.json({ ok: true });
    }

    // status:{orderId}:{newStatus}
    if (data.startsWith('status:')) {
      const [, orderId, newStatus] = data.split(':');
      if (supabase && orderId && newStatus) {
        await supabase
          .from('orders')
          .update({
            status: newStatus,
            ...(newStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
          })
          .eq('id', orderId);

        await supabase.from('order_status_log').insert({
          order_id: orderId,
          status: newStatus,
        });

        const statusLabels: Record<string, string> = {
          in_production: '🖨 В печати',
          shipped: '📦 Отправлен',
          delivered: '✅ Доставлен',
        };

        await answerCallbackQuery(cb.id, `Статус: ${statusLabels[newStatus] ?? newStatus}`);

        // Remove buttons after action
        if (newStatus === 'delivered' && messageId) {
          await editMessageReplyMarkup(chatId, messageId);
        }
      }
      return NextResponse.json({ ok: true });
    }

    // ship:{orderId} — ask for tracking number
    if (data.startsWith('ship:')) {
      const orderId = data.split(':')[1];
      await answerCallbackQuery(cb.id, 'Отправьте трек-номер');
      await sendMessage({
        chatId,
        text: `📦 Введите трек-номер для заказа:\n\n<code>/track ${orderId} ТРЕК-НОМЕР</code>`,
      });
      return NextResponse.json({ ok: true });
    }

    await answerCallbackQuery(cb.id);
    return NextResponse.json({ ok: true });
  }

  // Handle text messages (commands)
  if (body.message?.text) {
    const chatId = String(body.message.chat.id);
    const text = body.message.text.trim();

    if (chatId !== adminChatId) {
      return NextResponse.json({ ok: true });
    }

    // /orders — list active orders
    if (text === '/orders') {
      if (!supabase) {
        await sendMessage({ chatId, text: '❌ БД недоступна' });
        return NextResponse.json({ ok: true });
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('order_number, status, amount_kzt, recipient_name, created_at')
        .in('status', ['paid', 'in_production', 'shipped'])
        .order('created_at', { ascending: false })
        .limit(20);

      await sendMessage({ chatId, text: formatOrdersList(orders ?? []) });
      return NextResponse.json({ ok: true });
    }

    // /order {number} — order details
    if (text.startsWith('/order ')) {
      const num = text.split(' ')[1];
      if (!supabase || !num) {
        await sendMessage({ chatId, text: '❌ Укажите номер заказа' });
        return NextResponse.json({ ok: true });
      }

      const { data: order } = await supabase
        .from('orders')
        .select('*, products(name_ru, size)')
        .eq('order_number', Number(num))
        .single();

      if (!order) {
        await sendMessage({ chatId, text: `❌ Заказ #${num} не найден` });
        return NextResponse.json({ ok: true });
      }

      const product = order.products as { name_ru: string; size: string } | null;
      const lines = [
        `📋 <b>Заказ #${order.order_number}</b>`,
        '',
        `📦 ${product?.name_ru ?? '?'} (${product?.size ?? '?'})`,
        `💰 ${order.amount_kzt?.toLocaleString()} ₸`,
        `📊 Статус: ${order.status}`,
        `💳 Оплата: ${order.payment_status}`,
        '',
        `👤 ${order.recipient_name}`,
        `📱 ${order.recipient_phone}`,
        `📍 ${order.city}, ${order.address}`,
        order.tracking_number ? `🚚 Трек: ${order.tracking_number}` : '',
        '',
        `🖼 <a href="${order.image_url}">Изображение</a>`,
        order.image_stored ? `💾 <a href="${order.image_stored}">Бэкап</a>` : '',
      ].filter(Boolean).join('\n');

      const replyMarkup = {
        inline_keyboard: [
          [{ text: '✅ В работу', callback_data: `status:${order.id}:in_production` }],
          [{ text: '📦 Отправлено', callback_data: `ship:${order.id}` }],
          [{ text: '✔️ Доставлено', callback_data: `status:${order.id}:delivered` }],
        ],
      };

      await sendMessage({ chatId, text: lines, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    // /track {orderId} {trackingNumber} — set tracking
    if (text.startsWith('/track ')) {
      const parts = text.split(' ');
      const orderId = parts[1];
      const trackingNumber = parts.slice(2).join(' ');

      if (!supabase || !orderId || !trackingNumber) {
        await sendMessage({ chatId, text: '❌ Формат: /track ORDER_ID ТРЕК-НОМЕР' });
        return NextResponse.json({ ok: true });
      }

      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          status: 'shipped',
          shipped_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        await sendMessage({ chatId, text: `❌ Ошибка: ${error.message}` });
      } else {
        await supabase.from('order_status_log').insert({
          order_id: orderId,
          status: 'shipped',
          comment: `Трек: ${trackingNumber}`,
        });
        await sendMessage({ chatId, text: `✅ Трек-номер ${trackingNumber} добавлен, статус: Отправлен` });
      }
      return NextResponse.json({ ok: true });
    }

    // /stats — basic statistics
    if (text === '/stats') {
      if (!supabase) {
        await sendMessage({ chatId, text: '❌ БД недоступна' });
        return NextResponse.json({ ok: true });
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [today, week, month, total] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
        supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ]);

      const { data: revenue } = await supabase
        .from('orders')
        .select('amount_kzt')
        .eq('payment_status', 'paid');

      const totalRevenue = (revenue ?? []).reduce((sum, o) => sum + (o.amount_kzt ?? 0), 0);

      const stats = [
        '📊 <b>Статистика</b>',
        '',
        `Сегодня: ${today.count ?? 0} заказов`,
        `Неделя: ${week.count ?? 0} заказов`,
        `Месяц: ${month.count ?? 0} заказов`,
        `Всего: ${total.count ?? 0} заказов`,
        '',
        `💰 Выручка: ${totalRevenue.toLocaleString()} ₸`,
      ].join('\n');

      await sendMessage({ chatId, text: stats });
      return NextResponse.json({ ok: true });
    }

    // /help
    if (text === '/help' || text === '/start') {
      await sendMessage({
        chatId,
        text: [
          '🤖 <b>Шежіре — бот заказов</b>',
          '',
          '/orders — Активные заказы',
          '/order {номер} — Детали заказа',
          '/track {id} {трек} — Добавить трек-номер',
          '/stats — Статистика',
        ].join('\n'),
      });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: true });
}
