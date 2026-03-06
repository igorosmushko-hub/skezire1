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
): number {
  const cx = W / 2;
  let y = 180; // Start below ornamental top border

  // "Шежіре" — large title with strong glow
  ctx.save();
  ctx.font = '700 56px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(200,168,75,0.7)';
  ctx.shadowBlur = 40;
  ctx.fillText('Ш Е Ж І Р Е', cx, y);
  // Double-draw for stronger glow
  ctx.shadowBlur = 20;
  ctx.fillText('Ш Е Ж І Р Е', cx, y);
  ctx.restore();
  y += 72;

  // Subtitle: locale label
  const subLabel = locale === 'kk' ? 'ГЕНЕАЛОГИЯЛЫҚ АҒАШ' : 'ГЕНЕАЛОГИЧЕСКОЕ ДРЕВО';
  ctx.save();
  ctx.font = '400 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.6;
  ctx.letterSpacing = '5px';
  ctx.fillText(subLabel, cx, y);
  ctx.restore();
  y += 30;

  // Divider
  drawDiamondDivider(ctx, cx, y, W - 160, GOLD);
  y += 28;

  // Zhuz name
  if (zhuzDisplay) {
    ctx.save();
    ctx.font = '600 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.8;
    ctx.letterSpacing = '2px';
    ctx.fillText(zhuzDisplay.toUpperCase(), cx, y);
    ctx.restore();
    y += 30;
  }

  // Ru name — prominent
  if (ruName) {
    ctx.save();
    ctx.font = '700 36px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(200,168,75,0.5)';
    ctx.shadowBlur = 20;
    ctx.fillText(ruName, cx, y);
    ctx.restore();
    y += 48;
  }

  // Second divider
  drawDiamondDivider(ctx, cx, y, W - 240, GOLD);
  y += 24;

  return y;
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
      ctx.fillStyle = 'rgba(30,12,0,0.85)';
    } else if (hasFill) {
      ctx.fillStyle = GOLD;
      ctx.globalAlpha = 0.85;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
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
    ctx.font = `${isUser ? '700' : '600'} ${fSize}px "Cormorant Garamond", Georgia, serif`;
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
    ctx.font = '700 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.7;
    ctx.letterSpacing = '4px';
    ctx.fillText(uranLabel, cx, y);
    ctx.restore();
    y += 24;

    ctx.save();
    ctx.font = 'italic 700 32px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(200,168,75,0.6)';
    ctx.shadowBlur = 24;
    ctx.fillText(`«${uran}!»`, cx, y);
    // Double draw for glow
    ctx.shadowBlur = 10;
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
  const footerY = H - 80; // Above bottom ornament

  drawDiamondDivider(ctx, cx, footerY - 20, W - 160, GOLD);

  ctx.save();
  ctx.font = '400 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.6;
  ctx.letterSpacing = '4px';
  ctx.shadowColor = 'rgba(200,168,75,0.3)';
  ctx.shadowBlur = 8;
  ctx.fillText('SKEZIRE.KZ', cx, footerY);
  ctx.restore();
}

/* ── Main composition ──────────────────────────────────────────── */

/* ── Load image helper ─────────────────────────────────────────── */

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ── AI Portrait in oval frame ─────────────────────────────────── */

function drawAiPortrait(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  y: number,
  name: string,
  birthYear: string,
): number {
  const pw = 220, ph = 280;
  const px = cx - pw / 2;

  // Oval clip
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, px, y, pw, ph);
  ctx.restore();

  // Oval border — outer glow
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(200,168,75,0.5)';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Thin inner border
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2 - 6, ph / 2 - 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Name below portrait
  let labelY = y + ph + 16;
  ctx.save();
  ctx.font = '700 28px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(200,168,75,0.3)';
  ctx.shadowBlur = 10;
  ctx.fillText(name, cx, labelY);
  ctx.restore();
  labelY += 36;

  // Birth year
  if (birthYear) {
    ctx.save();
    ctx.font = '400 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.5;
    ctx.fillText(birthYear, cx, labelY);
    ctx.restore();
    labelY += 28;
  }

  return labelY + 8;
}

export async function generateShareImage(
  canvas: HTMLCanvasElement,
  data: ShareImageData,
  locale: string,
  tribe: TribeInfo | null,
  aiPhotoUrl?: string,
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const hasPhoto = !!aiPhotoUrl;
  const ctx = canvas.getContext('2d')!;
  const W = 1080;

  // Calculate height dynamically based on content
  const topMargin = 180;
  const headerHeight = 200; // title + subtitle + dividers + zhuz
  const portraitHeight = hasPhoto ? 400 : 0; // oval + name + year + divider
  const nodeH = 86;
  const nodeGap = 22;
  const nodeCount = data.ancestors.length + 1; // ancestors + user
  const treeHeight = nodeCount * (nodeH + nodeGap) - nodeGap;
  const bottomContent = 200; // info + footer + bottom margin
  const H = topMargin + headerHeight + portraitHeight + treeHeight + bottomContent;

  canvas.width = W;
  canvas.height = H;

  // Pre-load template background & AI photo in parallel
  const loadPromises: Promise<HTMLImageElement | null>[] = [
    loadImage('/tree-template-bg.webp').catch(() => null),
  ];
  if (aiPhotoUrl) {
    loadPromises.push(
      loadImage(`/api/ai/download?url=${encodeURIComponent(aiPhotoUrl)}`).catch(() => null),
    );
  }
  const [templateBg, aiImg] = await Promise.all(loadPromises);

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
  if (templateBg) {
    // Draw AI-generated ornamental template as base layer
    ctx.drawImage(templateBg, 0, 0, W, H);
    // Add subtle color tint matching zhuz colors
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // Vignette for depth
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Fallback: programmatic background + texture + border
    drawBackground(ctx, W, H, colors);
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
    drawDoubleBorder(ctx, W, H, GOLD);
  }

  // --- 2. Tamga watermark (very subtle) ---
  drawTamgaWatermark(ctx, tamga || '', W / 2, H / 2);

  // --- 3. Header ---
  const headerEndY = drawHeader(ctx, W, zhuzDisplay, ruName, locale);

  // --- 4. AI Portrait (if available) ---
  let treeStartY = headerEndY;
  if (aiImg) {
    treeStartY = drawAiPortrait(
      ctx, aiImg, W / 2, headerEndY,
      data.name, (data as unknown as { birthYear?: string }).birthYear || '',
    );
    // Divider after portrait
    drawDiamondDivider(ctx, W / 2, treeStartY, W - 200, GOLD);
    treeStartY += 28;
  }

  // --- 7. Tree ---
  const treeEndY = drawTreeOnCanvas(ctx, nodes, colors, treeStartY, W);

  // --- 8. Info section ---
  drawInfoSection(ctx, W, treeEndY, uran, locale);

  // --- 9. Footer ---
  drawFooter(ctx, W, H);

  return canvas;
}
