import { ZHUZ_COLORS, GOLD } from '@/lib/constants';
import { roundRect, drawTamgaWatermark, ensureFontsLoaded } from '@/lib/canvas/utils';
import { drawDiamondDivider } from '@/lib/canvas/diamond';
import { drawOrnamentalBorder } from '@/lib/canvas/ornaments';

/* ── Types ─────────────────────────────────────────────────────── */

export interface TreeNode {
  kaz: string;
  label: string;
  name: string;
  isUser?: boolean;
}

export interface ShareImageData {
  name: string;
  zhuz: string;
  zhuzLabel: string;
  ru: string;
  ancestors: TreeNode[];
}

export interface TribeInfo {
  tamga: string;
  uran: string;
}

/* ── Background ─────────────────────────────────────────────────── */

function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  colors: { bg: string; bgMid: string },
): void {
  // Base fill
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow from upper-center
  const topGlow = ctx.createRadialGradient(W / 2, H * 0.25, 0, W / 2, H * 0.25, W * 0.85);
  topGlow.addColorStop(0, colors.bgMid);
  topGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  // Subtle horizontal light band across center
  const band = ctx.createLinearGradient(0, H * 0.38, 0, H * 0.62);
  band.addColorStop(0, 'rgba(255,255,255,0)');
  band.addColorStop(0.5, 'rgba(255,255,255,0.025)');
  band.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, W, H);

  // Vignette — darken edges
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

/* ── Double ornamental border ───────────────────────────────────── */

function drawDoubleBorder(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;

  // Outer frame
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Inner frame (main)
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // Corner accent squares
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = 1;
  const cs = 14; // corner square size
  const cm = 36; // corner margin
  const corners: [number, number][] = [
    [cm, cm], [W - cm - cs, cm], [W - cm - cs, H - cm - cs], [cm, H - cm - cs],
  ];
  for (const [cx, cy] of corners) {
    ctx.strokeRect(cx, cy, cs, cs);
    // Diagonal line inside
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + cs, cy + cs);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + cs, cy);
    ctx.lineTo(cx, cy + cs);
    ctx.stroke();
  }

  ctx.restore();

  // Full ornamental border (ram horns etc.)
  drawOrnamentalBorder(ctx, W, H, color);
}

/* ── Header ─────────────────────────────────────────────────────── */

function drawHeader(
  ctx: CanvasRenderingContext2D,
  W: number,
  zhuzDisplay: string,
  ruName: string,
  locale: string,
): void {
  const cx = W / 2;

  // "Шежіре" — large title
  ctx.save();
  ctx.font = '700 52px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(200,168,75,0.5)';
  ctx.shadowBlur = 30;
  ctx.fillText('Шежіре', cx, 62);
  ctx.restore();

  // Subtitle: locale label
  const subLabel = locale === 'kk' ? 'ШЕЖІРЕ' : 'ГЕНЕАЛОГИЧЕСКОЕ ДРЕВО';
  ctx.save();
  ctx.font = '400 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.45;
  ctx.letterSpacing = '4px';
  ctx.fillText(subLabel, cx, 122);
  ctx.restore();

  // Divider
  drawDiamondDivider(ctx, cx, 152, W - 120, GOLD);

  // Zhuz name
  if (zhuzDisplay) {
    ctx.save();
    ctx.font = '400 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.65;
    ctx.fillText(zhuzDisplay.toUpperCase(), cx, 172);
    ctx.restore();
  }

  // Ru name — prominent
  if (ruName) {
    ctx.save();
    ctx.font = '700 32px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(200,168,75,0.35)';
    ctx.shadowBlur = 15;
    ctx.fillText(ruName, cx, 198);
    ctx.restore();
  }

  // Second divider
  drawDiamondDivider(ctx, cx, 244, W - 200, GOLD);
}

/* ── Tree ────────────────────────────────────────────────────────── */

export function drawTreeOnCanvas(
  ctx: CanvasRenderingContext2D,
  nodes: Array<{ kaz: string; label: string; name: string; isUser?: boolean }>,
  colors: { nodeTop: string; nodeBot: string; accent: string },
  startY: number,
  W: number,
): number {
  const nodeW = 480;
  const nodeH = 86;
  const gap = 22;
  const cx = W / 2;
  const unknownText = '· · ·';

  nodes.forEach((node, i) => {
    const x = cx - nodeW / 2;
    const y = startY + i * (nodeH + gap);
    const midY = y + nodeH / 2;
    const isUser = node.isUser === true;
    const hasFill = !!node.name;

    // Connector line + arrow
    if (i < nodes.length - 1) {
      const y1 = y + nodeH;
      const y2 = y + nodeH + gap - 8;
      ctx.save();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = hasFill ? 0.6 : 0.22;
      if (!hasFill) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, y1);
      ctx.lineTo(cx, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small diamond connector ornament
      if (hasFill) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = GOLD;
        const dm = y1 + (gap / 2) - 2;
        ctx.beginPath();
        ctx.moveTo(cx, dm - 4);
        ctx.lineTo(cx + 4, dm);
        ctx.lineTo(cx, dm + 4);
        ctx.lineTo(cx - 4, dm);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Node shadow/glow
    if (isUser || hasFill) {
      ctx.save();
      ctx.shadowColor = isUser ? 'rgba(200,168,75,0.4)' : 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = isUser ? 28 : 14;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      roundRect(ctx, x, y, nodeW, nodeH, 10);
      ctx.fill();
      ctx.restore();
    }

    // Node background
    ctx.save();
    if (isUser) {
      const grad = ctx.createLinearGradient(x, y, x + nodeW, y + nodeH);
      grad.addColorStop(0, '#C8981A');
      grad.addColorStop(0.35, '#ECC84A');
      grad.addColorStop(0.65, '#F0D060');
      grad.addColorStop(1, '#8A6010');
      ctx.fillStyle = grad;
    } else if (hasFill) {
      const grad = ctx.createLinearGradient(x, y, x, y + nodeH);
      grad.addColorStop(0, colors.nodeTop);
      grad.addColorStop(1, colors.nodeBot);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
    }
    roundRect(ctx, x, y, nodeW, nodeH, 10);
    ctx.fill();
    ctx.restore();

    // Left accent bar (filled non-user nodes)
    if (hasFill && !isUser) {
      ctx.save();
      const barGrad = ctx.createLinearGradient(x, y, x, y + nodeH);
      barGrad.addColorStop(0, colors.accent + 'CC');
      barGrad.addColorStop(1, colors.accent + '30');
      ctx.fillStyle = barGrad;
      roundRect(ctx, x, y, 4, nodeH, 10);
      ctx.fill();
      ctx.restore();
    }

    // Node border
    ctx.save();
    if (isUser) {
      ctx.strokeStyle = '#F0CC55';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(200,168,75,0.6)';
      ctx.shadowBlur = 12;
    } else if (hasFill) {
      ctx.strokeStyle = 'rgba(200,168,75,0.35)';
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
    }
    roundRect(ctx, x, y, nodeW, nodeH, 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Generation label (top-left, small caps)
    ctx.save();
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.letterSpacing = '1.5px';
    if (isUser) {
      ctx.fillStyle = 'rgba(30,12,0,0.75)';
    } else if (hasFill) {
      ctx.fillStyle = 'rgba(200,168,75,0.7)';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
    }
    ctx.fillText(node.kaz.toUpperCase(), x + 20, y + 11);
    ctx.restore();

    // Name
    const nameStr = node.name || unknownText;
    let fSize = 28;
    if (nameStr.length > 24) fSize = 19;
    else if (nameStr.length > 18) fSize = 22;
    else if (nameStr.length > 14) fSize = 25;

    ctx.save();
    ctx.font = `${isUser ? '700' : '600'} ${fSize}px "Playfair Display", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isUser) {
      ctx.fillStyle = '#1A0800';
      ctx.shadowColor = 'rgba(255,255,255,0.15)';
      ctx.shadowBlur = 4;
    } else if (hasFill) {
      ctx.fillStyle = '#F5F0E8';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
    }

    let displayName = nameStr;
    const maxW = nodeW - 80;
    if (ctx.measureText(displayName).width > maxW) {
      while (displayName.length > 3 && ctx.measureText(displayName + '…').width > maxW) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '…';
    }
    ctx.fillText(displayName, cx, midY + 8);
    ctx.restore();

    // User star ornament
    if (isUser) {
      ctx.save();
      ctx.fillStyle = 'rgba(30,12,0,0.35)';
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', x + 30, midY + 8);
      ctx.fillText('★', x + nodeW - 30, midY + 8);
      ctx.restore();
    }
  });

  return startY + nodes.length * (nodeH + gap) - gap;
}

/* ── Info section ────────────────────────────────────────────────── */

function drawInfoSection(
  ctx: CanvasRenderingContext2D,
  W: number,
  afterTreeY: number,
  uran: string,
  locale: string,
): void {
  const cx = W / 2;
  let y = afterTreeY + 28;

  drawDiamondDivider(ctx, cx, y, W - 120, GOLD);
  y += 38;

  if (uran) {
    const uranLabel = locale === 'kk' ? 'ҰРАНЫ' : 'УРАН';
    ctx.save();
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.5;
    ctx.letterSpacing = '3px';
    ctx.fillText(uranLabel, cx, y);
    ctx.restore();
    y += 22;

    ctx.save();
    ctx.font = 'italic 700 28px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.9;
    ctx.shadowColor = 'rgba(200,168,75,0.4)';
    ctx.shadowBlur = 18;
    ctx.fillText(`«${uran}!»`, cx, y);
    ctx.restore();
  }
}

/* ── Footer ──────────────────────────────────────────────────────── */

function drawFooter(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
): void {
  const cx = W / 2;

  drawDiamondDivider(ctx, cx, H - 104, W - 120, GOLD);

  ctx.save();
  ctx.font = '300 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.4;
  ctx.letterSpacing = '3px';
  ctx.fillText('SKEZIRE.KZ', cx, H - 70);
  ctx.restore();
}

/* ── Main composition ──────────────────────────────────────────── */

export async function generateShareImage(
  canvas: HTMLCanvasElement,
  data: ShareImageData,
  locale: string,
  tribe: TribeInfo | null,
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const ctx = canvas.getContext('2d')!;
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;

  const zhuzId = data.zhuz || 'other';
  const colors = ZHUZ_COLORS[zhuzId] || ZHUZ_COLORS.other;

  const tamga = tribe ? tribe.tamga : null;
  const ruName = data.ru;
  const uran = tribe ? tribe.uran : '';

  const zhuzNames: Record<string, Record<string, string>> = {
    kk: { uly: 'Ұлы жүз', orta: 'Орта жүз', kishi: 'Кіші жүз', other: 'Жүзден тыс' },
    ru: { uly: 'Ұлы жүз', orta: 'Орта жүз', kishi: 'Кіші жүз', other: 'Вне жузов' },
  };
  const zhuzDisplay = data.zhuz ? (zhuzNames[locale]?.[data.zhuz] ?? '') : '';

  const youLabel = locale === 'kk' ? 'Сіз' : 'Вы';
  const nodes: TreeNode[] = [
    ...data.ancestors.slice().reverse(),
    { kaz: youLabel, label: '', name: data.name, isUser: true },
  ];

  // --- 1. Background ---
  drawBackground(ctx, W, H, colors);

  // --- 2. Subtle diamond texture ---
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 0.4;
  ctx.globalAlpha = 0.06;
  const ds = 70;
  for (let gy = 0; gy < H; gy += ds) {
    for (let gx = 0; gx < W; gx += ds) {
      ctx.beginPath();
      ctx.moveTo(gx + ds / 2, gy);
      ctx.lineTo(gx + ds, gy + ds / 2);
      ctx.lineTo(gx + ds / 2, gy + ds);
      ctx.lineTo(gx, gy + ds / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();

  // --- 3. Tamga watermark ---
  drawTamgaWatermark(ctx, tamga || '', W / 2, H / 2);

  // --- 4. Double border + ornaments ---
  drawDoubleBorder(ctx, W, H, GOLD);

  // --- 5. Header ---
  drawHeader(ctx, W, zhuzDisplay, ruName, locale);

  // --- 6. Tree ---
  const treeStartY = 262;
  const treeEndY = drawTreeOnCanvas(ctx, nodes, colors, treeStartY, W);

  // --- 7. Info section ---
  drawInfoSection(ctx, W, treeEndY, uran, locale);

  // --- 8. Footer ---
  drawFooter(ctx, W, H);

  return canvas;
}
