"use client";

import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import DownloadQrPosterButton from "@/components/DownloadQrPosterButton";
import { usePublicUrl } from "@/lib/usePublicUrl";

export default function MasjidQrCard({
  masjidName,
  address,
  slug,
}: {
  masjidName: string;
  address: string | null;
  slug: string;
}) {
  const { t } = useLanguage();
  const publicUrl = usePublicUrl(`/masjid/${slug}`);

  return (
    <div className="card p-4 text-center space-y-3">
      <p className="text-base font-semibold text-slate-600">{t.editor.scanToOpen}</p>
      {publicUrl && (
        <div className="flex justify-center p-3 bg-teal-50 rounded-xl inline-block mx-auto">
          <QRCodeSVG value={publicUrl} size={160} fgColor="#0a5347" />
        </div>
      )}
      <DownloadQrPosterButton
        masjidName={masjidName}
        address={address}
        publicUrl={publicUrl}
        slug={slug}
      />
    </div>
  );
}
