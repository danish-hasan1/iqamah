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
  const [searchError, setSearchError] = useState(false);
  const [nearbyError, setNearbyError] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (query.trim().length === 0) return;
    setLoading(true);
    setSearched(true);
    setSearchError(false);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("masjids")
      .select("*")
      .ilike("name", `%${query.trim()}%`)
      .limit(30);
    if (error) setSearchError(true);
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
    setNearbyError(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const supabase = createClient();
        const { data, error } = await supabase.from("masjids").select("*");
        if (error) {
          setNearbyError(true);
          setLocating(false);
          return;
        }
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
      <h1 className="text-2xl font-bold text-teal-800 pt-2 mb-5">{t.search.title}</h1>

      {/* Zero-typing options first — easiest for most people */}
      <div className="space-y-3 mb-6">
        <button onClick={findNearby} disabled={locating} className="btn-primary">
          {locating ? t.search.locating : `📍 ${t.search.nearbyBtn}`}
        </button>
        <Link href="/scan" className="btn-secondary block">
          📷 {t.search.scanBtn}
        </Link>
      </div>

      {locError && <p className="text-red-500 text-base mb-3">{locError}</p>}
      {nearbyError && <p className="text-red-500 text-base mb-3">{t.search.loadError}</p>}

      <div className="flex items-center gap-3 mb-4 text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-medium">{t.search.orDivider}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search.searchPlaceholder}
          aria-label={t.search.searchPlaceholder}
          className="flex-1 min-w-0 min-h-14 rounded-2xl border-2 border-slate-200 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="shrink-0 px-4 min-h-14 rounded-2xl bg-gradient-to-b from-teal-600 to-teal-800 text-white text-lg font-semibold shadow-[0_4px_14px_-4px_rgba(10,83,71,0.55)] transition active:scale-[0.98]"
        >
          {t.search.searchBtn}
        </button>
      </form>

      {nearby && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-3">{t.search.nearbyHeading}</h2>
          <div className="space-y-3">
            {nearby.map((m) => (
              <Link key={m.id} href={`/masjid/${m.slug}`} className="card block p-4">
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-bold truncate">{m.name}</div>
                    <div className="text-sm text-slate-400 truncate">{m.address}</div>
                  </div>
                  <div className="text-end text-sm shrink-0">
                    <div className="font-bold text-teal-700 text-base">
                      {m.dist.toFixed(1)} km
                    </div>
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
              <p className="text-slate-400 text-base">{t.search.noNearby}</p>
            )}
          </div>
        </div>
      )}

      {searched && (
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-3">{t.search.resultsHeading}</h2>
          {loading && <p className="text-slate-400 text-base">{t.search.searching}</p>}
          {searchError && <p className="text-red-500 text-base">{t.search.loadError}</p>}
          <div className="space-y-3">
            {results.map((m) => (
              <Link key={m.id} href={`/masjid/${m.slug}`} className="card block p-4">
                <div className="text-lg font-bold truncate">{m.name}</div>
                <div className="text-sm text-slate-400 truncate">{m.address}</div>
              </Link>
            ))}
            {!loading && !searchError && results.length === 0 && (
              <p className="text-slate-400 text-base">
                {t.search.noResults} &quot;{query}&quot;.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
