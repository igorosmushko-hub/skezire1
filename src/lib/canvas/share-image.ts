import { ZHUZ_COLORS, GOLD } from '@/lib/constants';
import { roundRect, drawTamgaWatermark, ensureFontsLoaded } from '@/lib/canvas/utils';
import { drawDiamondGrid, drawDiamondDivider } from '@/lib/canvas/diamond';
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

/* ── Draw tree on canvas ───────────────────────────────────────── */

export function drawTreeOnCanvas(
  ctx: CanvasRenderingContext2D,
  nodes: Array<{ kaz: string; label: string; name: string; isUser?: boolean }>,
  colors: { nodeTop: string; nodeBot: string },
  startY: number,
  W: number,
): number {
  const nodeW = 400;
  const nodeH = 90;
  const gap = 30;
  const cx = W / 2;
  const unknownText = '\u00b7 \u00b7 \u00b7';

  nodes.forEach((node, i) => {
    const x = cx - nodeW / 2;
    const y = startY + i * (nodeH + gap);
    const midY = y + nodeH / 2;
    const isUser = node.isUser === true;
    const hasFill = !!node.name;

    // Connector to next node
    if (i < nodes.length - 1) {
      const y1 = y + nodeH;
      const y2 = y + nodeH + gap - 10;
      ctx.save();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.globalAlpha = hasFill ? 0.75 : 0.28;
      if (!hasFill) ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, y1);
      ctx.lineTo(cx, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.moveTo(cx, y2 + 10);
      ctx.lineTo(cx - 5, y2);
      ctx.lineTo(cx + 5, y2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Node background
    ctx.save();
    if (isUser) {
      // Gold gradient
      const grad = ctx.createLinearGradient(x, y, x + nodeW, y + nodeH);
      grad.addColorStop(0, '#E8C96A');
      grad.addColorStop(1, '#7A5E18');
      ctx.fillStyle = grad;
      // Glow
      ctx.shadowColor = 'rgba(200,168,75,0.5)';
      ctx.shadowBlur = 16;
    } else if (hasFill) {
      const grad = ctx.createLinearGradient(x, y, x, y + nodeH);
      grad.addColorStop(0, colors.nodeTop);
      grad.addColorStop(1, colors.nodeBot);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
    }
    roundRect(ctx, x, y, nodeW, nodeH, 12);
    ctx.fill();
    ctx.restore();

    // Node border
    ctx.save();
    if (isUser) {
      ctx.strokeStyle = '#E8C96A';
      ctx.lineWidth = 1.5;
    } else if (hasFill) {
      ctx.strokeStyle = 'rgba(200,168,75,0.3)';
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
    }
    roundRect(ctx, x, y, nodeW, nodeH, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Generation label
    ctx.save();
    ctx.font = '800 15px Inter, sans-serif';
    ctx.letterSpacing = '0.5px';
    if (isUser) {
      ctx.fillStyle = 'rgba(60,30,0,0.7)';
    } else if (hasFill) {
      ctx.fillStyle = 'rgba(200,168,75,0.85)';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(node.kaz.toUpperCase(), x + 16, y + 14);
    ctx.restore();

    // Name
    const nameStr = node.name || unknownText;
    let fSize = 26;
    if (nameStr.length > 22) fSize = 20;
    else if (nameStr.length > 16) fSize = 23;

    ctx.save();
    ctx.font = `600 ${fSize}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isUser) {
      ctx.fillStyle = '#1A0A00';
    } else if (hasFill) {
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
    }

    // Truncate if too wide
    let displayName = nameStr;
    const maxW = nodeW - 60;
    if (ctx.measureText(displayName).width > maxW) {
      while (displayName.length > 3 && ctx.measureText(displayName + '...').width > maxW) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '...';
    }
    ctx.fillText(displayName, cx, midY + 8);
    ctx.restore();

    // Decorative ornament
    if (isUser) {
      ctx.save();
      ctx.font = '18px serif';
      ctx.fillStyle = 'rgba(50,25,0,0.4)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2605', x + nodeW - 24, midY + 4);
      ctx.restore();
    } else if (hasFill) {
      ctx.save();
      ctx.font = '16px serif';
      ctx.fillStyle = 'rgba(200,168,75,0.38)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2726', x + nodeW - 24, midY + 4);
      ctx.restore();
    }
  });

  // Return the Y coordinate after the last node
  return startY + nodes.length * (nodeH + gap) - gap;
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

  // Gather data
  const zhuzId = data.zhuz || 'other';
  const colors = ZHUZ_COLORS[zhuzId] || ZHUZ_COLORS.other;

  // Tribe info
  const tamga = tribe ? tribe.tamga : null;
  const ruName = data.ru;
  const uran = tribe ? tribe.uran : '';

  // Zhuz display name
  const zhuzDisplay = data.zhuz
    ? (locale === 'kk'
      ? { uly: '\u04B0\u043B\u044B \u0436\u04AF\u0437', orta: '\u041E\u0440\u0442\u0430 \u0436\u04AF\u0437', kishi: '\u041A\u0456\u0448\u0456 \u0436\u04AF\u0437', other: '\u0416\u04AF\u0437\u0434\u0435\u043D \u0442\u044B\u0441' }[data.zhuz]
      : { uly: '\u04B0\u043B\u044B \u0436\u04AF\u0437', orta: '\u041E\u0440\u0442\u0430 \u0436\u04AF\u0437', kishi: '\u041A\u0456\u0448\u0456 \u0436\u04AF\u0437', other: '\u0412\u043D\u0435 \u0436\u0443\u0437\u043E\u0432' }[data.zhuz])
    : '';

  // Build node list: oldest -> user (same as renderTree)
  const youLabel = locale === 'kk' ? '\u0421\u0456\u0437' : '\u0412\u044B';
  const nodes: TreeNode[] = [
    ...data.ancestors.slice().reverse(),
    { kaz: youLabel, label: '', name: data.name, isUser: true },
  ];

  // --- Layer 1: Background ---
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, H);

  // --- Layer 2: Diamond grid ---
  drawDiamondGrid(ctx, W, H, GOLD);

  // --- Layer 3: Ornamental border ---
  drawOrnamentalBorder(ctx, W, H, GOLD);

  // --- Layer 4: Title "Шежіре" ---
  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.font = '700 48px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(200,168,75,0.3)';
  ctx.shadowBlur = 20;
  ctx.fillText('\u0428\u0435\u0436\u0456\u0440\u0435', W / 2, 68);
  ctx.restore();

  // --- Layer 5: Top divider ---
  drawDiamondDivider(ctx, W / 2, 140, W - 120, GOLD);

  // --- Layer 6: Tamga watermark ---
  drawTamgaWatermark(ctx, tamga || '', W / 2, H / 2);

  // --- Layer 7: Tree ---
  const treeStartY = 170;
  drawTreeOnCanvas(ctx, nodes, colors, treeStartY, W);

  // --- Layer 8: Tribe info ---
  const infoY = treeStartY + nodes.length * (90 + 30) - 30 + 25;

  if (zhuzDisplay || ruName) {
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.8;
    ctx.font = '500 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    const parts = [zhuzDisplay, ruName].filter(Boolean);
    ctx.fillText(parts.join('  \u00b7  '), W / 2, infoY);
    ctx.restore();
  }

  if (uran) {
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.55;
    ctx.font = 'italic 18px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    const uranLabel = locale === 'kk' ? '\u04B0\u0440\u0430\u043D\u044B' : '\u0423\u0440\u0430\u043D';
    ctx.fillText(`${uranLabel}: ${uran}`, W / 2, infoY + 32);
    ctx.restore();
  }

  // --- Layer 9: Bottom divider + branding ---
  drawDiamondDivider(ctx, W / 2, H - 100, W - 120, GOLD);

  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.45;
  ctx.font = '300 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('skezire.kz', W / 2, H - 60);
  ctx.restore();

  return canvas;
}
