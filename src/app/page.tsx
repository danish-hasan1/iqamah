"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device";
import { formatTime } from "@/lib/utils";
import type { Masjid } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Logo from "@/components/Logo";

type FollowedMasjid = {
  tag: string;
  notify_salah: boolean;
  notify_time_change: boolean;
  masjid: Masjid;
};

const TAG_ICON: Record<string, string> = { home: "🏡", work: "🏢", other: "📍" };

export default function HomePage() {
  const [items, setItems] = useState<FollowedMasjid[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { t } = useLanguage();
  const TAG_LABEL: Record<string, string> = {
    home: t.home.tagHome,
    work: t.home.tagWork,
    other: t.home.tagOther,
  };

  useEffect(() => {
    (async () => {
      setLoadError(false);
      const supabase = createClient();
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from("follows")
        .select("tag, notify_salah, notify_time_change, masjid:masjids(*)")
        .eq("device_id", deviceId);

      if (error) {
        setLoadError(true);
        return;
      }
      setItems((data as unknown as FollowedMasjid[]) || []);
    })();
  }, [reloadKey]);

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-b from-teal-700 to-teal-800 pb-9 pt-8 px-4 text-center">
        <div
          className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-gold-400/20 blur-2xl"
          aria-hidden
        />
        <div className="flex justify-center mb-3 drop-shadow-lg">
          <Logo size={72} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Iqamah</h1>
        <p className="text-base text-teal-100 mt-1">{t.home.tagline}</p>

        <Link
          href="/search"
          className="mt-6 flex items-center gap-3 bg-white rounded-2xl px-5 py-4 min-h-16 text-lg font-medium text-slate-500 shadow-lg active:scale-[0.98] transition"
        >
          <span className="text-teal-600 text-2xl">🔍</span>
          {t.home.searchPlaceholder}
        </Link>
      </div>
      <div className="geo-divider bg-teal-800" />

      <div className="p-4">
        <h2 className="text-xl font-bold text-teal-900 mb-3 px-1 mt-2">{t.home.myMasjids}</h2>

        {items === null && !loadError && (
          <p className="text-slate-400 text-base px-1">{t.home.loading}</p>
        )}

        {loadError && (
          <div className="card text-center py-8 px-6">
            <p className="text-base text-red-500 mb-3">{t.home.loadError}</p>
            <button onClick={() => setReloadKey((k) => k + 1)} className="btn-secondary">
              {t.home.retry}
            </button>
          </div>
        )}

        {!loadError && items?.length === 0 && (
          <div className="card text-center py-14 px-6 text-slate-400">
            <div className="text-5xl mb-3">🕌</div>
            <p className="text-base whitespace-pre-line leading-relaxed">{t.home.empty}</p>
          </div>
        )}

        <div className="space-y-3">
          {items?.map((f) => (
            <Link
              key={f.masjid.id}
              href={`/masjid/${f.masjid.slug}`}
              className="card block p-4 active:scale-[0.99] transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-slate-800 truncate">
                    {f.masjid.name}
                  </div>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-sm font-medium bg-teal-50 text-teal-700 rounded-full px-3 py-1">
                    {TAG_ICON[f.tag] || "📍"} {TAG_LABEL[f.tag] || f.tag}
                  </span>
                </div>
                <div className="text-end text-sm text-slate-500 shrink-0">
                  {f.masjid.isha && (
                    <div>
                      {t.prayer.isha}{" "}
                      <span className="font-bold text-teal-700 text-base">
                        {formatTime(f.masjid.isha)}
                      </span>
                    </div>
                  )}
                  {f.masjid.fajr && (
                    <div>
                      {t.prayer.fajr}{" "}
                      <span className="font-bold text-teal-700 text-base">
                        {formatTime(f.masjid.fajr)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
