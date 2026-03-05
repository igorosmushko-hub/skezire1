/**
 * Apply a "skezire.kz" watermark to an image and return a Blob.
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

  // Watermark text
  const text = 'skezire.kz';
  const fontSize = Math.max(14, Math.round(canvas.width * 0.028));
  const padding = Math.round(fontSize * 0.85);

  ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'right';

  // Shadow for readability on any background
  ctx.shadowColor = 'rgba(0,0,0,.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.fillText(text, canvas.width - padding, canvas.height - padding);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92);
  });
}
