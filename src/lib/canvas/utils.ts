import { GOLD } from '@/lib/constants';

/* ── Canvas helper: rounded rect ───────────────────────────────── */

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}

/* ── Tamga watermark ───────────────────────────────────────────── */

export function drawTamgaWatermark(
  ctx: CanvasRenderingContext2D,
  tamga: string,
  cx: number,
  cy: number,
): void {
  if (!tamga) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = GOLD;
  ctx.font = '420px Georgia, serif';

  // Glow layer
  ctx.globalAlpha = 0.04;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 80;
  ctx.fillText(tamga, cx, cy);

  // Main layer
  ctx.globalAlpha = 0.09;
  ctx.shadowBlur = 0;
  ctx.fillText(tamga, cx, cy);

  ctx.restore();
}

/* ── Font loading helper ───────────────────────────────────────── */

export async function ensureFontsLoaded(): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // Trigger loading of needed fonts
  const families = ['Playfair Display', 'Inter'];
  for (const f of families) {
    try { await document.fonts.load(`400 48px "${f}"`); } catch (_) { /* ok */ }
    try { await document.fonts.load(`700 48px "${f}"`); } catch (_) { /* ok */ }
  }
}
