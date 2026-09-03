"use client";

import { useState } from "react";
import { generateQrPoster, downloadDataUrl } from "@/lib/qrPoster";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DownloadQrPosterButton({
  masjidName,
  address,
  publicUrl,
  slug,
  variant = "secondary",
}: {
  masjidName: string;
  address: string | null;
  publicUrl: string;
  slug: string;
  variant?: "primary" | "secondary";
}) {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const dataUrl = await generateQrPoster({
        masjidName,
        address,
        publicUrl,
        captionLines: [t.qrPoster.caption1, t.qrPoster.caption2],
        footerLabel: t.qrPoster.footer,
      });
      downloadDataUrl(dataUrl, `${slug}-qr-poster.png`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className={variant === "primary" ? "btn-primary" : "btn-secondary"}
    >
      {generating ? t.qrPoster.generating : `🖨️ ${t.qrPoster.download}`}
    </button>
  );
}
