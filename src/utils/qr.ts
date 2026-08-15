import { toCanvas } from 'qrcode';

interface BrandedQrOptions {
  payload: string;
  logoUrl: string;
  size?: number;
}

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar el logo para el QR.'));
    image.src = src;
  });
};

const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export const createBrandedQrDataUrl = async ({ payload, logoUrl, size = 360 }: BrandedQrOptions) => {
  const canvas = document.createElement('canvas');

  await toCanvas(canvas, payload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: size,
    color: {
      dark: '#1D1D1F',
      light: '#FFFFFF',
    },
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo generar el QR.');

  const logo = await loadImage(logoUrl);
  const logoBox = size * 0.24;
  const logoSize = size * 0.18;
  const boxX = (size - logoBox) / 2;
  const logoX = (size - logoSize) / 2;

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  roundedRect(ctx, boxX, boxX, logoBox, logoBox, size * 0.045);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(logo, logoX, logoX, logoSize, logoSize);

  return canvas.toDataURL('image/png');
};
