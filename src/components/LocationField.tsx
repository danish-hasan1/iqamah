"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

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
          placeholder="Search an address..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="px-3 rounded-lg bg-teal-100 text-teal-800 text-sm font-medium"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y max-h-40 overflow-y-auto">
          {results.map((r, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                onChange(r.lat, r.lng);
                setResults([]);
                setQuery(r.label);
              }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-teal-50"
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
        className="text-sm text-teal-700 font-medium"
      >
        {locating ? "Locating..." : "📍 Use my current location"}
      </button>

      <MapPicker lat={lat} lng={lng} onChange={onChange} />
      <p className="text-xs text-slate-400">
        Tap on the map or drag the pin to fine-tune the exact spot.
      </p>
    </div>
  );
}
