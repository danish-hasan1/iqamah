"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { distanceKm, formatTime } from "@/lib/utils";
import type { Masjid } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Masjid[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nearby, setNearby] = useState<(Masjid & { dist: number })[] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (query.trim().length === 0) return;
    setLoading(true);
    setSearched(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("masjids")
      .select("*")
      .ilike("name", `%${query.trim()}%`)
      .limit(30);
    setResults((data as Masjid[]) || []);
    setLoading(false);
  }

  function findNearby() {
    if (!navigator.geolocation) {
      setLocError(t.search.locError);
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const supabase = createClient();
        const { data } = await supabase.from("masjids").select("*");
        const list = ((data as Masjid[]) || [])
          .map((m) => ({
            ...m,
            dist: distanceKm(pos.coords.latitude, pos.coords.longitude, m.lat, m.lng),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 25);
        setNearby(list);
        setLocating(false);
      },
      () => {
        setLocError(t.search.locError);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-teal-800 pt-2 mb-4">{t.search.title}</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search.searchPlaceholder}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-4 rounded-xl bg-gradient-to-b from-teal-600 to-teal-800 text-white text-sm font-semibold shadow-[0_4px_14px_-4px_rgba(10,83,71,0.55)] transition active:scale-[0.98]"
        >
          {t.search.searchBtn}
        </button>
      </form>

      <button onClick={findNearby} disabled={locating} className="btn-secondary mb-3">
        {locating ? t.search.locating : `📍 ${t.search.nearbyBtn}`}
      </button>
      <Link href="/scan" className="btn-secondary block mb-5">
        📷 {t.search.scanBtn}
      </Link>
      {locError && <p className="text-red-500 text-sm mb-3">{locError}</p>}

      {nearby && (
        <div className="mb-6">
          <h2 className="font-semibold text-slate-700 mb-2">{t.search.nearbyHeading}</h2>
          <div className="space-y-2">
            {nearby.map((m) => (
              <Link
                key={m.id}
                href={`/masjid/${m.slug}`}
                className="card block p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-slate-400">{m.address}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold text-teal-700">{m.dist.toFixed(1)} km</div>
                    {m.isha && (
                      <div className="text-slate-500">
                        {t.prayer.isha} {formatTime(m.isha)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {nearby.length === 0 && (
              <p className="text-slate-400 text-sm">{t.search.noNearby}</p>
            )}
          </div>
        </div>
      )}

      {searched && (
        <div>
          <h2 className="font-semibold text-slate-700 mb-2">{t.search.resultsHeading}</h2>
          {loading && <p className="text-slate-400 text-sm">{t.search.searching}</p>}
          <div className="space-y-2">
            {results.map((m) => (
              <Link
                key={m.id}
                href={`/masjid/${m.slug}`}
                className="card block p-4"
              >
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-slate-400">{m.address}</div>
              </Link>
            ))}
            {!loading && results.length === 0 && (
              <p className="text-slate-400 text-sm">
                {t.search.noResults} &quot;{query}&quot;.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
