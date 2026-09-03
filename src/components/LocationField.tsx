"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

type SearchResult = { label: string; lat: number; lng: number };

export default function LocationField({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  async function search() {
    if (query.trim().length < 3) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } finally {
      setSearching(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
          placeholder={t.newMasjid.searchAddress}
          aria-label={t.newMasjid.searchAddress}
          className="flex-1 min-w-0 min-h-12 rounded-xl border-2 border-slate-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="shrink-0 px-4 min-h-12 rounded-xl bg-teal-100 text-teal-800 text-base font-semibold"
        >
          {searching ? "..." : t.search.searchBtn}
        </button>
      </div>

      {results.length > 0 && (
        <div className="card divide-y divide-teal-100/80 max-h-52 overflow-y-auto">
          {results.map((r, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                onChange(r.lat, r.lng);
                setResults([]);
                setQuery(r.label);
              }}
              className="block w-full text-start px-4 py-3 min-h-12 text-base hover:bg-teal-50"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        className="text-base text-teal-700 font-semibold min-h-11 px-1"
      >
        {locating ? t.search.locating : t.newMasjid.useLocation}
      </button>

      <MapPicker lat={lat} lng={lng} onChange={onChange} />
      <p className="text-sm text-slate-400">{t.newMasjid.tapToFineTune}</p>
    </div>
  );
}
