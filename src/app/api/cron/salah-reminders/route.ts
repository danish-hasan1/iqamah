import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWebPush } from "@/lib/webpush";
import { PRAYER_LABELS, type PrayerKey } from "@/lib/types";

const REMINDER_PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

// Runs every few minutes (see /api/cron/README). For every masjid, checks whether
// "now" in the masjid's local timezone matches one of its prayer times to the
// minute, and if so notifies followers who opted into salah reminders.
export async function GET(req: NextRequest) {
  const webpush = getWebPush();
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: masjids } = await supabase.from("masjids").select("*");

  let notified = 0;

  for (const masjid of masjids || []) {
    const nowLocal = new Date().toLocaleTimeString("en-GB", {
      timeZone: masjid.timezone || "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }); // "HH:MM"

    const dateKey = new Date().toLocaleDateString("en-CA", {
      timeZone: masjid.timezone || "UTC",
    }); // "YYYY-MM-DD"

    for (const prayer of REMINDER_PRAYERS) {
      const t: string | null = masjid[prayer];
      if (!t) continue;
      const hhmm = t.slice(0, 5);
      if (hhmm !== nowLocal) continue;

      const dedupeKind = `salah_reminder_${prayer}_${dateKey}`;
      const { data: existing } = await supabase
        .from("masjid_updates")
        .select("id")
        .eq("masjid_id", masjid.id)
        .eq("kind", dedupeKind)
        .maybeSingle();

      if (existing) continue;

      await supabase.from("masjid_updates").insert({
        masjid_id: masjid.id,
        kind: dedupeKind,
        message: `${PRAYER_LABELS[prayer]} time at ${masjid.name}`,
      });

      const { data: follows } = await supabase
        .from("follows")
        .select("device_id")
        .eq("masjid_id", masjid.id)
        .eq("notify_salah", true);

      const deviceIds = (follows || []).map((f) => f.device_id);
      if (deviceIds.length === 0) continue;

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("device_id, subscription")
        .in("device_id", deviceIds);

      const staleDeviceIds: string[] = [];

      await Promise.all(
        (subs || []).map(async (row) => {
          try {
            await webpush.sendNotification(
              row.subscription,
              JSON.stringify({
                title: masjid.name,
                body: `It's time for ${PRAYER_LABELS[prayer]}`,
                url: `/masjid/${masjid.slug}`,
              }),
            );
            notified++;
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
    }
  }

  return NextResponse.json({ ok: true, notified });
}
