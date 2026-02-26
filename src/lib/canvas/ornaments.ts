import { roundRect } from '@/lib/canvas/utils';

/* ── Ornament: Ram horn motif (кошкар мүйіз) ──────────────────── */

export function drawRamHornMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  scale: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const s = scale || 1;

  // Left spiral
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-12 * s, -18 * s, -22 * s, -10 * s);
  ctx.quadraticCurveTo(-30 * s, -2 * s, -24 * s, 8 * s);
  ctx.quadraticCurveTo(-18 * s, 16 * s, -10 * s, 12 * s);
  ctx.stroke();

  // Right spiral
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(12 * s, -18 * s, 22 * s, -10 * s);
  ctx.quadraticCurveTo(30 * s, -2 * s, 24 * s, 8 * s);
  ctx.quadraticCurveTo(18 * s, 16 * s, 10 * s, 12 * s);
  ctx.stroke();

  ctx.restore();
}

export function drawCornerOrnament(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const s = 1.8;

  // Double spiral for corner
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14 * s, -22 * s, -26 * s, -12 * s);
  ctx.quadraticCurveTo(-34 * s, -2 * s, -28 * s, 10 * s);
  ctx.quadraticCurveTo(-20 * s, 20 * s, -10 * s, 14 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14 * s, -22 * s, 26 * s, -12 * s);
  ctx.quadraticCurveTo(34 * s, -2 * s, 28 * s, 10 * s);
  ctx.quadraticCurveTo(20 * s, 20 * s, 10 * s, 14 * s);
  ctx.stroke();

  ctx.restore();
}

export function drawOrnamentalBorder(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.35;

  // Inner border rect
  const m = 35;
  roundRect(ctx, m, m, W - m * 2, H - m * 2, 4);
  ctx.stroke();

  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1.2;

  // Corner ornaments
  drawCornerOrnament(ctx, m + 20, m + 20, 0);
  drawCornerOrnament(ctx, W - m - 20, m + 20, Math.PI / 2);
  drawCornerOrnament(ctx, W - m - 20, H - m - 20, Math.PI);
  drawCornerOrnament(ctx, m + 20, H - m - 20, -Math.PI / 2);

  // Side motifs — top and bottom
  const motifCount = 5;
  const spacing = (W - m * 2 - 120) / (motifCount + 1);
  for (let i = 1; i <= motifCount; i++) {
    const x = m + 60 + spacing * i;
    drawRamHornMotif(ctx, x, m + 6, Math.PI, 0.6);
    drawRamHornMotif(ctx, x, H - m - 6, 0, 0.6);
  }

  // Side motifs — left and right
  const motifCountV = 7;
  const spacingV = (H - m * 2 - 120) / (motifCountV + 1);
  for (let i = 1; i <= motifCountV; i++) {
    const y = m + 60 + spacingV * i;
    drawRamHornMotif(ctx, m + 6, y, Math.PI / 2, 0.6);
    drawRamHornMotif(ctx, W - m - 6, y, -Math.PI / 2, 0.6);
  }

  ctx.restore();
}
