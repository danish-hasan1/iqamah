import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: NextRequest) {
  const { masjidId, masjidName, kind, message } = await req.json();

  if (!masjidId || !message) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: masjidRow } = await supabase
    .from("masjids")
    .select("slug")
    .eq("id", masjidId)
    .single();

  await supabase.from("masjid_updates").insert({
    masjid_id: masjidId,
    kind: kind || "time_change",
    message,
  });

  const notifyCol = kind === "salah_reminder" ? "notify_salah" : "notify_time_change";

  const { data: follows } = await supabase
    .from("follows")
    .select("device_id")
    .eq("masjid_id", masjidId)
    .eq(notifyCol, true);

  const deviceIds = (follows || []).map((f) => f.device_id);
  if (deviceIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("device_id, subscription")
    .in("device_id", deviceIds);

  let sent = 0;
  const staleDeviceIds: string[] = [];

  await Promise.all(
    (subs || []).map(async (row) => {
      try {
        await webpush.sendNotification(
          row.subscription,
          JSON.stringify({
            title: masjidName || "Prayer time update",
            body: message,
            url: `/masjid/${masjidRow?.slug || masjidId}`,
          }),
        );
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          staleDeviceIds.push(row.device_id);
        }
      }
    }),
  );

  if (staleDeviceIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("device_id", staleDeviceIds);
  }

  return NextResponse.json({ ok: true, sent });
}
