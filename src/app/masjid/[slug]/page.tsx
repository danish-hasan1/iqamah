import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Masjid } from "@/lib/types";
import PrayerTimesTable from "@/components/PrayerTimesTable";
import FollowPanel from "@/components/FollowPanel";
import MasjidMapView from "@/components/MasjidMapView";
import GetDirectionsLink from "@/components/GetDirectionsLink";
import MasjidQrCard from "@/components/MasjidQrCard";

export default async function MasjidPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: masjid } = await supabase
    .from("masjids")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!masjid) notFound();
  const m = masjid as Masjid;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;

  return (
    <div>
      <div className="bg-gradient-to-b from-teal-700 to-teal-800 px-4 pt-6 pb-8 text-center">
        <div className="text-3xl mb-1">🕌</div>
        <h1 className="text-xl font-bold text-white">{m.name}</h1>
        {m.address && <p className="text-sm text-teal-100 mt-0.5">{m.address}</p>}
      </div>

      <div className="p-4 -mt-4 space-y-4">
        <FollowPanel masjidId={m.id} />

        <PrayerTimesTable masjid={m} />

        <div>
          <MasjidMapView lat={m.lat} lng={m.lng} />
          <GetDirectionsLink url={directionsUrl} />
        </div>

        {m.notes && <div className="card p-4 text-sm text-slate-600">{m.notes}</div>}

        <MasjidQrCard masjidName={m.name} address={m.address} slug={m.slug} />
      </div>
    </div>
  );
}
