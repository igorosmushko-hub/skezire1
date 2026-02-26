/* ── Diamond drawing helpers ───────────────────────────────────── */

export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
}

export function drawDiamondDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.6;

  // Center diamond
  drawDiamond(ctx, cx, y, 11);
  ctx.fill();

  // Side diamonds
  drawDiamond(ctx, cx - 40, y, 7);
  ctx.fill();
  drawDiamond(ctx, cx + 40, y, 7);
  ctx.fill();

  // Smaller outer diamonds
  ctx.globalAlpha = 0.4;
  drawDiamond(ctx, cx - 80, y, 4);
  ctx.fill();
  drawDiamond(ctx, cx + 80, y, 4);
  ctx.fill();

  // Dots
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(cx - 120, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 120, y, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Lines
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, y);
  ctx.lineTo(cx - 140, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 140, y);
  ctx.lineTo(cx + width / 2, y);
  ctx.stroke();

  ctx.restore();
}

export function drawDiamondGrid(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  color: string,
): void {
  ctx.save();
  const size = 80;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.1;
  for (let y = 0; y < H; y += size) {
    for (let x = 0; x < W; x += size) {
      drawDiamond(ctx, x + size / 2, y + size / 2, size / 2 - 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
