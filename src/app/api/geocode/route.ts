import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Iqamah-Salah-Timings-App (personal project)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const data = await res.json();
  const results = (data as Array<{ display_name: string; lat: string; lon: string }>).map(
    (r) => ({
      label: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }),
  );

  return NextResponse.json({ results });
}
