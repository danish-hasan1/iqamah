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
  const { t } = useLanguage();
  const TAG_LABEL: Record<string, string> = {
    home: t.home.tagHome,
    work: t.home.tagWork,
    other: t.home.tagOther,
  };

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const deviceId = getDeviceId();
      const { data } = await supabase
        .from("follows")
        .select("tag, notify_salah, notify_time_change, masjid:masjids(*)")
        .eq("device_id", deviceId);

      setItems((data as unknown as FollowedMasjid[]) || []);
    })();
  }, []);

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-b from-teal-700 to-teal-800 pb-8 pt-8 px-4 text-center">
        <div
          className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-gold-400/20 blur-2xl"
          aria-hidden
        />
        <div className="flex justify-center mb-3 drop-shadow-lg">
          <Logo size={64} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Iqamah</h1>
        <p className="text-sm text-teal-100 mt-1">{t.home.tagline}</p>

        <Link
          href="/search"
          className="mt-5 flex items-center gap-2 bg-white/95 rounded-full px-4 py-3 text-sm text-slate-400 shadow-lg"
        >
          <span className="text-teal-600">🔍</span>
          {t.home.searchPlaceholder}
        </Link>
      </div>

      <div className="p-4 -mt-2">
        <h2 className="font-semibold text-teal-900 mb-3 px-1">{t.home.myMasjids}</h2>

        {items === null && <p className="text-slate-400 text-sm px-1">{t.home.loading}</p>}

        {items?.length === 0 && (
          <div className="card text-center py-12 px-6 text-slate-400">
            <div className="text-3xl mb-2">🕌</div>
            <p className="text-sm whitespace-pre-line">{t.home.empty}</p>
          </div>
        )}

        <div className="space-y-3">
          {items?.map((f) => (
            <Link key={f.masjid.id} href={`/masjid/${f.masjid.slug}`} className="card block p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{f.masjid.name}</div>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs bg-teal-50 text-teal-700 rounded-full px-2 py-0.5">
                    {TAG_ICON[f.tag] || "📍"} {TAG_LABEL[f.tag] || f.tag}
                  </span>
                </div>
                <div className="text-end text-xs text-slate-500 shrink-0">
                  {f.masjid.isha && (
                    <div>
                      {t.prayer.isha}{" "}
                      <span className="font-semibold text-teal-700">
                        {formatTime(f.masjid.isha)}
                      </span>
                    </div>
                  )}
                  {f.masjid.fajr && (
                    <div>
                      {t.prayer.fajr}{" "}
                      <span className="font-semibold text-teal-700">
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
