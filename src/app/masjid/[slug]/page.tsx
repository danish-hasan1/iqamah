import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Masjid } from "@/lib/types";
import PrayerTimesTable from "@/components/PrayerTimesTable";
import FollowPanel from "@/components/FollowPanel";
import MasjidMapView from "@/components/MasjidMapView";
import GetDirectionsLink from "@/components/GetDirectionsLink";

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
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-teal-800">{m.name}</h1>
        {m.address && <p className="text-sm text-slate-500">{m.address}</p>}
      </div>

      <FollowPanel masjidId={m.id} />

      <PrayerTimesTable masjid={m} />

      <div>
        <MasjidMapView lat={m.lat} lng={m.lng} />
        <GetDirectionsLink url={directionsUrl} />
      </div>

      {m.notes && (
        <div className="bg-white rounded-xl p-4 border border-teal-100 text-sm text-slate-600">
          {m.notes}
        </div>
      )}
    </div>
  );
}
