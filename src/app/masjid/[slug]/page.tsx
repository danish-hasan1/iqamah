import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Masjid } from "@/lib/types";
import PrayerTimesTable from "@/components/PrayerTimesTable";
import FollowPanel from "@/components/FollowPanel";
import MasjidMapView from "@/components/MasjidMapView";

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
        <a
          href={directionsUrl}
          target="_blank"
          className="block text-center mt-2 text-sm text-teal-700 font-medium underline"
        >
          Get directions
        </a>
      </div>

      {m.notes && (
        <div className="bg-white rounded-xl p-4 border border-teal-100 text-sm text-slate-600">
          {m.notes}
        </div>
      )}
    </div>
  );
}
