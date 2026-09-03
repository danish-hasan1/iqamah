import QRCode from "qrcode";

// A4 at 150 DPI, portrait — big enough to print crisply, small enough to
// stay a manageable download.
const WIDTH = 1240;
const HEIGHT = 1754;
const MARGIN = 90;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateQrPoster({
  masjidName,
  address,
  publicUrl,
  captionLines,
  footerLabel,
}: {
  masjidName: string;
  address: string | null;
  publicUrl: string;
  /** Explains what scanning does — shown below the QR code. */
  captionLines: string[];
  /** e.g. "Powered by Iqamah" */
  footerLabel: string;
}): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Header band
  const headerHeight = 220;
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, headerHeight);
  gradient.addColorStop(0, "#12967d");
  gradient.addColorStop(1, "#0a5347");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, headerHeight);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 64px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("🕌 Iqamah", WIDTH / 2, headerHeight / 2 + 24);

  // Masjid name
  let y = headerHeight + 140;
  ctx.fillStyle = "#0a5347";
  ctx.font = "700 72px system-ui, -apple-system, 'Segoe UI', sans-serif";
  const nameLines = wrapText(ctx, masjidName, WIDTH - MARGIN * 2);
  for (const line of nameLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 88;
  }

  // Address
  if (address) {
    y += 20;
    ctx.fillStyle = "#475569";
    ctx.font = "400 40px system-ui, -apple-system, 'Segoe UI', sans-serif";
    const addressLines = wrapText(ctx, address, WIDTH - MARGIN * 2);
    for (const line of addressLines) {
      ctx.fillText(line, WIDTH / 2, y);
      y += 52;
    }
  }

  // QR code
  const qrSize = 720;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: qrSize,
    margin: 1,
    color: { dark: "#0a5347", light: "#ffffff" },
  });
  const qrImage = await loadImage(qrDataUrl);
  const qrY = y + 50;
  const qrBoxPadding = 30;
  ctx.fillStyle = "#f2faf7";
  ctx.strokeStyle = "#e1f2ea";
  ctx.lineWidth = 4;
  roundRect(
    ctx,
    (WIDTH - qrSize) / 2 - qrBoxPadding,
    qrY - qrBoxPadding,
    qrSize + qrBoxPadding * 2,
    qrSize + qrBoxPadding * 2,
    24,
  );
  ctx.fill();
  ctx.stroke();
  ctx.drawImage(qrImage, (WIDTH - qrSize) / 2, qrY, qrSize, qrSize);

  // Caption
  let captionY = qrY + qrSize + qrBoxPadding + 70;
  ctx.fillStyle = "#0a5347";
  ctx.font = "700 42px system-ui, -apple-system, 'Segoe UI', sans-serif";
  for (const line of captionLines) {
    const wrapped = wrapText(ctx, line, WIDTH - MARGIN * 2);
    for (const w of wrapped) {
      ctx.fillText(w, WIDTH / 2, captionY);
      captionY += 54;
    }
  }

  // Footer
  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 30px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(footerLabel, WIDTH / 2, HEIGHT - MARGIN + 10);
  ctx.font = "400 26px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(publicUrl.replace(/^https?:\/\//, ""), WIDTH / 2, HEIGHT - MARGIN + 50);

  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
