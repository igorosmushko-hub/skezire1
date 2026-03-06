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

/* ── Fixed canvas matching template ────────────────────────────── */

const W = 1080;
const H = 1620; // Matches tree-template-bg.webp exactly

// Safe area inside ornamental border
const SAFE_TOP = 110;
const SAFE_BOTTOM = 100;
const SAFE_X = 90;
const SAFE_W = W - SAFE_X * 2; // ~900px

/* ── Unified dark navy + gold palette ──────────────────────────── */

const NAVY = '#0A1628';
const NAVY_MID = '#101E3A';
const NODE_FILL = '#0E1A35';
const NODE_FILL_LIGHT = '#152448';
const NODE_BORDER = 'rgba(200,168,75,0.3)';
const NODE_EMPTY_BG = 'rgba(255,255,255,0.03)';
const NODE_EMPTY_BORDER = 'rgba(200,168,75,0.12)';

/* ── Background (fallback when no template) ────────────────────── */

function drawBackground(ctx: CanvasRenderingContext2D): void {
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

function drawFallbackBorder(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.restore();
  drawOrnamentalBorder(ctx, W, H, GOLD);
}

/* ── Header ────────────────────────────────────────────────────── */

function drawHeader(
  ctx: CanvasRenderingContext2D,
  zhuzDisplay: string,
  ruName: string,
  locale: string,
  hasTemplate: boolean,
  startY: number,
): number {
  const cx = W / 2;

  // Cover coat of arms area with dark overlay
  if (hasTemplate) {
    ctx.save();
    const coverGrad = ctx.createRadialGradient(cx, 75, 10, cx, 75, 180);
    coverGrad.addColorStop(0, 'rgba(10,20,40,0.92)');
    coverGrad.addColorStop(1, 'rgba(10,20,40,0)');
    ctx.fillStyle = coverGrad;
    ctx.fillRect(220, 0, W - 440, 160);
    ctx.restore();
  }

  let y = startY;

  // "Шежіре" title
  ctx.save();
  ctx.font = '700 46px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(200,168,75,0.6)';
  ctx.shadowBlur = 24;
  ctx.fillText('Ш Е Ж І Р Е', cx, y);
  ctx.shadowBlur = 10;
  ctx.fillText('Ш Е Ж І Р Е', cx, y);
  ctx.restore();
  y += 56;

  // Subtitle
  const subLabel = locale === 'kk' ? 'ГЕНЕАЛОГИЯЛЫҚ АҒАШ' : 'ГЕНЕАЛОГИЧЕСКОЕ ДРЕВО';
  ctx.save();
  ctx.font = '400 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.45;
  ctx.letterSpacing = '3px';
  ctx.fillText(subLabel, cx, y);
  ctx.restore();
  y += 22;

  drawDiamondDivider(ctx, cx, y, SAFE_W - 60, GOLD);
  y += 20;

  // Zhuz
  if (zhuzDisplay) {
    ctx.save();
    ctx.font = '600 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.65;
    ctx.letterSpacing = '2px';
    ctx.fillText(zhuzDisplay.toUpperCase(), cx, y);
    ctx.restore();
    y += 24;
  }

  // Ru name
  if (ruName) {
    ctx.save();
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(200,168,75,0.35)';
    ctx.shadowBlur = 12;
    ctx.fillText(ruName, cx, y);
    ctx.restore();
    y += 38;
  }

  drawDiamondDivider(ctx, cx, y, SAFE_W - 140, GOLD);
  y += 16;

  return y;
}

/* ── AI Portrait ───────────────────────────────────────────────── */

function drawAiPortrait(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  y: number,
  name: string,
  birthYear: string,
  budget: number, // available vertical space
): number {
  const cx = W / 2;
  // Scale portrait to fit budget
  const maxPortraitH = Math.min(220, budget - 80);
  const ph = maxPortraitH;
  const pw = Math.round(ph * 0.77); // ~3:4 aspect
  const px = cx - pw / 2;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, px, y, pw, ph);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(200,168,75,0.35)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(cx, y + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  let labelY = y + ph + 10;
  ctx.save();
  ctx.font = '700 22px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(200,168,75,0.2)';
  ctx.shadowBlur = 6;
  ctx.fillText(name, cx, labelY);
  ctx.restore();
  labelY += 28;

  if (birthYear) {
    ctx.save();
    ctx.font = '400 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.4;
    ctx.fillText(birthYear, cx, labelY);
    ctx.restore();
    labelY += 20;
  }

  drawDiamondDivider(ctx, cx, labelY, SAFE_W - 120, GOLD);
  return labelY + 16;
}

/* ── Compact tree ─────────────────────────────────────────────── */

export function drawTreeOnCanvas(
  ctx: CanvasRenderingContext2D,
  nodes: Array<{ kaz: string; label: string; name: string; isUser?: boolean }>,
  startY: number,
  nodeH: number,
  gap: number,
): number {
  const nodeW = Math.min(SAFE_W - 20, 440);
  const cx = W / 2;
  const unknownText = '· · ·';

  nodes.forEach((node, i) => {
    const x = cx - nodeW / 2;
    const y = startY + i * (nodeH + gap);
    const midY = y + nodeH / 2;
    const isUser = node.isUser === true;
    const hasFill = !!node.name;

    // Connector
    if (i < nodes.length - 1) {
      ctx.save();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1;
      ctx.globalAlpha = hasFill ? 0.45 : 0.12;
      if (!hasFill) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, y + nodeH);
      ctx.lineTo(cx, y + nodeH + gap - 3);
      ctx.stroke();
      ctx.setLineDash([]);

      if (hasFill) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = GOLD;
        const dm = y + nodeH + gap / 2;
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

    // Glow (user only)
    if (isUser) {
      ctx.save();
      ctx.shadowColor = 'rgba(200,168,75,0.3)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      roundRect(ctx, x, y, nodeW, nodeH, 6);
      ctx.fill();
      ctx.restore();
    }

    // Background
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
    roundRect(ctx, x, y, nodeW, nodeH, 6);
    ctx.fill();
    ctx.restore();

    // Left gold bar
    if (hasFill && !isUser) {
      ctx.save();
      const barGrad = ctx.createLinearGradient(x, y, x, y + nodeH);
      barGrad.addColorStop(0, GOLD + '99');
      barGrad.addColorStop(1, GOLD + '15');
      ctx.fillStyle = barGrad;
      roundRect(ctx, x, y, 3, nodeH, 6);
      ctx.fill();
      ctx.restore();
    }

    // Border
    ctx.save();
    if (isUser) {
      ctx.strokeStyle = '#E8C040';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(200,168,75,0.3)';
      ctx.shadowBlur = 6;
    } else if (hasFill) {
      ctx.strokeStyle = NODE_BORDER;
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = NODE_EMPTY_BORDER;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
    }
    roundRect(ctx, x, y, nodeW, nodeH, 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Label
    const labelSize = nodeH < 50 ? 9 : 10;
    ctx.save();
    ctx.font = `700 ${labelSize}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.letterSpacing = '1px';
    if (isUser) ctx.fillStyle = 'rgba(30,12,0,0.75)';
    else if (hasFill) { ctx.fillStyle = GOLD; ctx.globalAlpha = 0.7; }
    else ctx.fillStyle = 'rgba(200,168,75,0.25)';
    ctx.fillText(node.kaz.toUpperCase(), x + 14, y + 6);
    ctx.restore();

    // Name
    const nameStr = node.name || unknownText;
    let fSize = nodeH < 50 ? 18 : 22;
    if (nameStr.length > 24) fSize = Math.round(fSize * 0.7);
    else if (nameStr.length > 18) fSize = Math.round(fSize * 0.8);
    else if (nameStr.length > 14) fSize = Math.round(fSize * 0.9);

    ctx.save();
    ctx.font = `${isUser ? '700' : '600'} ${fSize}px "Cormorant Garamond", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isUser) ctx.fillStyle = '#1A0800';
    else if (hasFill) { ctx.fillStyle = GOLD; ctx.globalAlpha = 0.85; }
    else ctx.fillStyle = 'rgba(200,168,75,0.18)';

    let displayName = nameStr;
    const maxTextW = nodeW - 50;
    if (ctx.measureText(displayName).width > maxTextW) {
      while (displayName.length > 3 && ctx.measureText(displayName + '…').width > maxTextW) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '…';
    }
    ctx.fillText(displayName, cx, midY + (nodeH < 50 ? 4 : 5));
    ctx.restore();

    // Stars on user node
    if (isUser) {
      ctx.save();
      ctx.fillStyle = 'rgba(30,12,0,0.25)';
      ctx.font = `${nodeH < 50 ? 11 : 13}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', x + 20, midY + 4);
      ctx.fillText('★', x + nodeW - 20, midY + 4);
      ctx.restore();
    }
  });

  return startY + nodes.length * (nodeH + gap) - gap;
}

/* ── Info section ────────────────────────────────────────────────── */

function drawInfoSection(
  ctx: CanvasRenderingContext2D,
  afterTreeY: number,
  uran: string,
  locale: string,
): void {
  const cx = W / 2;
  let y = afterTreeY + 18;
  drawDiamondDivider(ctx, cx, y, SAFE_W - 60, GOLD);
  y += 26;

  if (uran) {
    const uranLabel = locale === 'kk' ? 'ҰРАНЫ' : 'УРАН';
    ctx.save();
    ctx.font = '700 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.55;
    ctx.letterSpacing = '3px';
    ctx.fillText(uranLabel, cx, y);
    ctx.restore();
    y += 18;

    ctx.save();
    ctx.font = 'italic 700 24px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GOLD;
    ctx.shadowColor = 'rgba(200,168,75,0.4)';
    ctx.shadowBlur = 14;
    ctx.fillText(`«${uran}!»`, cx, y);
    ctx.restore();
  }
}

/* ── Footer ──────────────────────────────────────────────────────── */

function drawFooter(ctx: CanvasRenderingContext2D): void {
  const cx = W / 2;
  const footerY = H - SAFE_BOTTOM + 10;
  drawDiamondDivider(ctx, cx, footerY - 16, SAFE_W - 80, GOLD);
  ctx.save();
  ctx.font = '400 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.45;
  ctx.letterSpacing = '3px';
  ctx.fillText('SKEZIRE.KZ', cx, footerY);
  ctx.restore();
}

/* ── Load image ────────────────────────────────────────────────── */

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
  canvas.width = W;
  canvas.height = H;

  // Load assets
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
  const nodeCount = nodes.length;

  // --- 1. Background ---
  if (templateBg) {
    // Draw at native size — no stretching
    ctx.drawImage(templateBg, 0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  } else {
    drawBackground(ctx);
    drawFallbackBorder(ctx);
  }

  // --- 2. Tamga watermark ---
  drawTamgaWatermark(ctx, tamga || '', W / 2, H / 2);

  // --- 3. Calculate layout to fit safe area ---
  // Available space: from SAFE_TOP to H - SAFE_BOTTOM - footerSpace
  const footerSpace = 60;
  const totalAvailable = H - SAFE_TOP - SAFE_BOTTOM - footerSpace;

  // Header takes ~160px, info section ~70px
  const headerBudget = 160;
  const infoBudget = uran ? 70 : 30;
  const treeBudget = totalAvailable - headerBudget - infoBudget - (hasPhoto ? 0 : 0);

  // Calculate node sizes to fit
  let portraitBudget = 0;
  if (hasPhoto && aiImg) {
    portraitBudget = Math.min(320, treeBudget * 0.35);
  }
  const treeSpace = treeBudget - portraitBudget;
  // nodeH + gap per node, minus one gap
  // treeSpace = nodeCount * (nodeH + gap) - gap
  // Solve for nodeH with gap = nodeH * 0.2 (proportional)
  const rawNodeStep = treeSpace / nodeCount;
  const gap = Math.max(8, Math.min(12, Math.round(rawNodeStep * 0.15)));
  const nodeH = Math.max(40, Math.min(60, Math.round(rawNodeStep - gap)));

  // --- 4. Header ---
  const headerEndY = drawHeader(ctx, zhuzDisplay, ruName, locale, !!templateBg, SAFE_TOP);

  // --- 5. Portrait ---
  let treeStartY = headerEndY;
  if (hasPhoto && aiImg) {
    treeStartY = drawAiPortrait(
      ctx, aiImg, headerEndY,
      data.name, (data as unknown as { birthYear?: string }).birthYear || '',
      portraitBudget,
    );
  }

  // --- 6. Tree ---
  const treeEndY = drawTreeOnCanvas(ctx, nodes, treeStartY, nodeH, gap);

  // --- 7. Info ---
  drawInfoSection(ctx, treeEndY, uran, locale);

  // --- 8. Footer ---
  drawFooter(ctx);

  return canvas;
}
