import { GOLD } from '@/lib/constants';
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

/* ── Unified dark navy + gold palette ──────────────────────────── */

const NAVY = '#0A1628';
const NAVY_MID = '#101E3A';
const NODE_FILL = '#0E1A35';
const NODE_FILL_LIGHT = '#152448';
const NODE_BORDER = 'rgba(200,168,75,0.3)';
const NODE_EMPTY_BG = 'rgba(255,255,255,0.03)';
const NODE_EMPTY_BORDER = 'rgba(200,168,75,0.12)';

/* ── Background ─────────────────────────────────────────────────── */

function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
): void {
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);

  const topGlow = ctx.createRadialGradient(W / 2, H * 0.25, 0, W / 2, H * 0.25, W * 0.85);
  topGlow.addColorStop(0, NAVY_MID);
  topGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

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

  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  ctx.globalAlpha = 0.65;
  ctx.lineWidth = 1;
  const cs = 14;
  const cm = 36;
  const corners: [number, number][] = [
    [cm, cm], [W - cm - cs, cm], [W - cm - cs, H - cm - cs], [cm, H - cm - cs],
  ];
  for (const [cx, cy] of corners) {
    ctx.strokeRect(cx, cy, cs, cs);
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

  drawOrnamentalBorder(ctx, W, H, color);
}

/* ── Header (title covers coat of arms area) ───────────────────── */

function drawHeader(
  ctx: CanvasRenderingContext2D,
  W: number,
  zhuzDisplay: string,
  ruName: string,
  locale: string,
  hasTemplate: boolean,
): number {
  const cx = W / 2;

  // Cover the coat of arms area on template with dark overlay
  if (hasTemplate) {
    ctx.save();
    const coverGrad = ctx.createRadialGradient(cx, 80, 10, cx, 80, 200);
    coverGrad.addColorStop(0, 'rgba(10,20,40,0.95)');
    coverGrad.addColorStop(1, 'rgba(10,20,40,0)');
    ctx.fillStyle = coverGrad;
    ctx.fillRect(200, 0, W - 400, 170);
    ctx.restore();
  }

  // "Шежіре" — large title
  let y = 70;
  ctx.save();
  ctx.font = '700 52px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(200,168,75,0.6)';
  ctx.shadowBlur = 30;
  ctx.fillText('Ш Е Ж І Р Е', cx, y);
  ctx.shadowBlur = 14;
  ctx.fillText('Ш Е Ж І Р Е', cx, y);
  ctx.restore();
  y += 64;

  // Subtitle
  const subLabel = locale === 'kk' ? 'ГЕНЕАЛОГИЯЛЫҚ АҒАШ' : 'ГЕНЕАЛОГИЧЕСКОЕ ДРЕВО';
  ctx.save();
  ctx.font = '400 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.5;
  ctx.letterSpacing = '4px';
  ctx.fillText(subLabel, cx, y);
  ctx.restore();
  y += 28;

  drawDiamondDivider(ctx, cx, y, W - 200, GOLD);
  y += 24;

  // Zhuz name
  if (zhuzDisplay) {
    ctx.save();
    ctx.font = '600 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.7;
    ctx.letterSpacing = '2px';
    ctx.fillText(zhuzDisplay.toUpperCase(), cx, y);
    ctx.restore();
    y += 28;
  }

  // Ru name
  if (ruName) {
    ctx.save();
    ctx.font = '700 32px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(200,168,75,0.4)';
    ctx.shadowBlur = 16;
    ctx.fillText(ruName, cx, y);
    ctx.restore();
    y += 44;
  }

  drawDiamondDivider(ctx, cx, y, W - 280, GOLD);
  y += 20;

  return y;
}

/* ── Compact tree ─────────────────────────────────────────────── */

const TREE_NODE_W = 460;
const TREE_NODE_H = 64;
const TREE_GAP = 14;

export function drawTreeOnCanvas(
  ctx: CanvasRenderingContext2D,
  nodes: Array<{ kaz: string; label: string; name: string; isUser?: boolean }>,
  startY: number,
  W: number,
): number {
  const nodeW = TREE_NODE_W;
  const nodeH = TREE_NODE_H;
  const gap = TREE_GAP;
  const cx = W / 2;
  const unknownText = '· · ·';

  nodes.forEach((node, i) => {
    const x = cx - nodeW / 2;
    const y = startY + i * (nodeH + gap);
    const midY = y + nodeH / 2;
    const isUser = node.isUser === true;
    const hasFill = !!node.name;

    // Connector line
    if (i < nodes.length - 1) {
      const y1 = y + nodeH;
      const y2 = y + nodeH + gap - 4;
      ctx.save();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1;
      ctx.globalAlpha = hasFill ? 0.5 : 0.15;
      if (!hasFill) ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, y1);
      ctx.lineTo(cx, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (hasFill) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = GOLD;
        const dm = y1 + (gap / 2);
        ctx.beginPath();
        ctx.moveTo(cx, dm - 3);
        ctx.lineTo(cx + 3, dm);
        ctx.lineTo(cx, dm + 3);
        ctx.lineTo(cx - 3, dm);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Node glow
    if (isUser) {
      ctx.save();
      ctx.shadowColor = 'rgba(200,168,75,0.35)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      roundRect(ctx, x, y, nodeW, nodeH, 8);
      ctx.fill();
      ctx.restore();
    }

    // Node background
    ctx.save();
    if (isUser) {
      const grad = ctx.createLinearGradient(x, y, x + nodeW, y + nodeH);
      grad.addColorStop(0, '#B08818');
      grad.addColorStop(0.4, '#D4A843');
      grad.addColorStop(0.7, '#DEBB55');
      grad.addColorStop(1, '#7A5810');
      ctx.fillStyle = grad;
    } else if (hasFill) {
      const grad = ctx.createLinearGradient(x, y, x, y + nodeH);
      grad.addColorStop(0, NODE_FILL_LIGHT);
      grad.addColorStop(1, NODE_FILL);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = NODE_EMPTY_BG;
    }
    roundRect(ctx, x, y, nodeW, nodeH, 8);
    ctx.fill();
    ctx.restore();

    // Left gold accent bar (filled nodes)
    if (hasFill && !isUser) {
      ctx.save();
      const barGrad = ctx.createLinearGradient(x, y, x, y + nodeH);
      barGrad.addColorStop(0, GOLD + 'AA');
      barGrad.addColorStop(1, GOLD + '20');
      ctx.fillStyle = barGrad;
      roundRect(ctx, x, y, 3, nodeH, 8);
      ctx.fill();
      ctx.restore();
    }

    // Node border
    ctx.save();
    if (isUser) {
      ctx.strokeStyle = '#E8C040';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(200,168,75,0.4)';
      ctx.shadowBlur = 8;
    } else if (hasFill) {
      ctx.strokeStyle = NODE_BORDER;
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = NODE_EMPTY_BORDER;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
    }
    roundRect(ctx, x, y, nodeW, nodeH, 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Generation label (top-left)
    ctx.save();
    ctx.font = '700 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.letterSpacing = '1.5px';
    if (isUser) {
      ctx.fillStyle = 'rgba(30,12,0,0.8)';
    } else if (hasFill) {
      ctx.fillStyle = GOLD;
      ctx.globalAlpha = 0.75;
    } else {
      ctx.fillStyle = 'rgba(200,168,75,0.3)';
    }
    ctx.fillText(node.kaz.toUpperCase(), x + 16, y + 8);
    ctx.restore();

    // Name
    const nameStr = node.name || unknownText;
    let fSize = 24;
    if (nameStr.length > 24) fSize = 16;
    else if (nameStr.length > 18) fSize = 18;
    else if (nameStr.length > 14) fSize = 20;

    ctx.save();
    ctx.font = `${isUser ? '700' : '600'} ${fSize}px "Cormorant Garamond", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isUser) {
      ctx.fillStyle = '#1A0800';
    } else if (hasFill) {
      ctx.fillStyle = GOLD;
      ctx.globalAlpha = 0.9;
    } else {
      ctx.fillStyle = 'rgba(200,168,75,0.2)';
    }

    let displayName = nameStr;
    const maxW = nodeW - 60;
    if (ctx.measureText(displayName).width > maxW) {
      while (displayName.length > 3 && ctx.measureText(displayName + '…').width > maxW) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '…';
    }
    ctx.fillText(displayName, cx, midY + 6);
    ctx.restore();

    // User star ornament
    if (isUser) {
      ctx.save();
      ctx.fillStyle = 'rgba(30,12,0,0.3)';
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', x + 24, midY + 6);
      ctx.fillText('★', x + nodeW - 24, midY + 6);
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
  let y = afterTreeY + 24;

  drawDiamondDivider(ctx, cx, y, W - 160, GOLD);
  y += 32;

  if (uran) {
    const uranLabel = locale === 'kk' ? 'ҰРАНЫ' : 'УРАН';
    ctx.save();
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.6;
    ctx.letterSpacing = '4px';
    ctx.fillText(uranLabel, cx, y);
    ctx.restore();
    y += 22;

    ctx.save();
    ctx.font = 'italic 700 28px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(200,168,75,0.5)';
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
  const footerY = H - 70;

  drawDiamondDivider(ctx, cx, footerY - 18, W - 200, GOLD);

  ctx.save();
  ctx.font = '400 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.5;
  ctx.letterSpacing = '4px';
  ctx.shadowColor = 'rgba(200,168,75,0.2)';
  ctx.shadowBlur = 6;
  ctx.fillText('SKEZIRE.KZ', cx, footerY);
  ctx.restore();
}

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
  const pw = 200, ph = 260;
  const px = cx - pw / 2;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, px, y, pw, ph);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(200,168,75,0.4)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2 - 5, ph / 2 - 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  let labelY = y + ph + 12;
  ctx.save();
  ctx.font = '700 26px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(200,168,75,0.3)';
  ctx.shadowBlur = 8;
  ctx.fillText(name, cx, labelY);
  ctx.restore();
  labelY += 32;

  if (birthYear) {
    ctx.save();
    ctx.font = '400 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.45;
    ctx.fillText(birthYear, cx, labelY);
    ctx.restore();
    labelY += 24;
  }

  return labelY + 6;
}

/* ── Main composition ──────────────────────────────────────────── */

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

  // Calculate height dynamically
  const topMargin = 70;
  const headerHeight = 180;
  const portraitHeight = hasPhoto ? 360 : 0;
  const nodeCount = data.ancestors.length + 1;
  const treeHeight = nodeCount * (TREE_NODE_H + TREE_GAP) - TREE_GAP;
  const bottomContent = 180;
  const H = topMargin + headerHeight + portraitHeight + treeHeight + bottomContent;

  canvas.width = W;
  canvas.height = H;

  // Pre-load template background & AI photo
  const loadPromises: Promise<HTMLImageElement | null>[] = [
    loadImage('/tree-template-bg.webp').catch(() => null),
  ];
  if (aiPhotoUrl) {
    loadPromises.push(
      loadImage(`/api/ai/download?url=${encodeURIComponent(aiPhotoUrl)}`).catch(() => null),
    );
  }
  const [templateBg, aiImg] = await Promise.all(loadPromises);

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
    ctx.drawImage(templateBg, 0, 0, W, H);
    // Dark navy tint for consistency
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // Vignette
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  } else {
    drawBackground(ctx, W, H);
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

  // --- 2. Tamga watermark ---
  drawTamgaWatermark(ctx, tamga || '', W / 2, H / 2);

  // --- 3. Header (covers coat of arms area) ---
  const headerEndY = drawHeader(ctx, W, zhuzDisplay, ruName, locale, !!templateBg);

  // --- 4. AI Portrait ---
  let treeStartY = headerEndY;
  if (aiImg) {
    treeStartY = drawAiPortrait(
      ctx, aiImg, W / 2, headerEndY,
      data.name, (data as unknown as { birthYear?: string }).birthYear || '',
    );
    drawDiamondDivider(ctx, W / 2, treeStartY, W - 240, GOLD);
    treeStartY += 22;
  }

  // --- 5. Tree ---
  const treeEndY = drawTreeOnCanvas(ctx, nodes, treeStartY, W);

  // --- 6. Info section ---
  drawInfoSection(ctx, W, treeEndY, uran, locale);

  // --- 7. Footer ---
  drawFooter(ctx, W, H);

  return canvas;
}
