"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device";
import { formatTime } from "@/lib/utils";
import type { Masjid } from "@/lib/types";

type FollowedMasjid = {
  tag: string;
  notify_salah: boolean;
  notify_time_change: boolean;
  masjid: Masjid;
};

const TAG_ICON: Record<string, string> = { home: "🏡", work: "🏢", other: "📍" };

export default function HomePage() {
  const [items, setItems] = useState<FollowedMasjid[] | null>(null);

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
    <div className="p-4">
      <div className="pt-4 pb-2 text-center">
        <div className="text-4xl mb-1">🕌</div>
        <h1 className="text-2xl font-bold text-teal-800">Iqamah</h1>
        <p className="text-sm text-slate-500">Salah timings, wherever you are</p>
      </div>

      <Link
        href="/search"
        className="block bg-white rounded-xl px-4 py-3 my-5 shadow-sm border border-teal-100 text-slate-400 text-sm"
      >
        🔍 Search masjids by name or find ones nearby...
      </Link>

      <h2 className="font-semibold text-slate-700 mb-3">My Masjids</h2>

      {items === null && <p className="text-slate-400 text-sm">Loading...</p>}

      {items?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">
            You haven&apos;t saved any masjids yet.
            <br />
            Scan a QR code or search to add one.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items?.map((f) => (
          <Link
            key={f.masjid.id}
            href={`/masjid/${f.masjid.slug}`}
            className="block bg-white rounded-xl p-4 shadow-sm border border-teal-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">
                  {TAG_ICON[f.tag] || "📍"} {f.masjid.name}
                </div>
                <div className="text-xs text-slate-400 capitalize">{f.tag}</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                {f.masjid.isha && (
                  <div>
                    Isha <span className="font-semibold text-teal-700">{formatTime(f.masjid.isha)}</span>
                  </div>
                )}
                {f.masjid.fajr && (
                  <div>
                    Fajr <span className="font-semibold text-teal-700">{formatTime(f.masjid.fajr)}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
