/**
 * Apply a "skezire.kz" watermark to an image and return a Blob.
 * Watermark is positioned in the social-media safe zone (center-bottom at ~85% height)
 * with a dark pill background for visibility on any background.
 * A secondary subtle watermark is placed in the top-right corner.
 */
export async function applyWatermark(imageUrl: string): Promise<Blob> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  const text = 'skezire.kz';

  // --- Main watermark: center-bottom, safe zone for Instagram/TikTok ---
  const mainFontSize = Math.max(16, Math.round(canvas.width * 0.035));
  ctx.font = `600 ${mainFontSize}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const metrics = ctx.measureText(text);
  const pillPadX = Math.round(mainFontSize * 1.2);
  const pillPadY = Math.round(mainFontSize * 0.5);
  const pillW = metrics.width + pillPadX * 2;
  const pillH = mainFontSize + pillPadY * 2;
  const pillX = (canvas.width - pillW) / 2;
  const pillY = canvas.height * 0.85 - pillH / 2;
  const pillRadius = Math.round(pillH / 2);

  // Dark semi-transparent pill background
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fill();
  ctx.restore();

  // White text on pill
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.3)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = 'rgba(255,255,255,.95)';
  ctx.fillText(text, canvas.width / 2, canvas.height * 0.85);
  ctx.restore();

  // --- Secondary watermark: top-right corner, subtle ---
  const smallFontSize = Math.max(11, Math.round(canvas.width * 0.02));
  const smallPadding = Math.round(smallFontSize * 0.8);
  ctx.save();
  ctx.font = `500 ${smallFontSize}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'right';
  ctx.shadowColor = 'rgba(0,0,0,.4)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  ctx.fillText(text, canvas.width - smallPadding, smallPadding);
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92);
  });
}
