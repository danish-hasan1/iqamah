import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { getWebPush } from "@/lib/webpush";

export async function POST(req: NextRequest) {
  const webpush = getWebPush();
  const { masjidId, masjidName, kind, message: rawMessage } = await req.json();
  const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

  if (!masjidId || !message) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: masjidRow } = await supabase
    .from("masjids")
    .select("slug, admin_id")
    .eq("id", masjidId)
    .single();

  if (!masjidRow || masjidRow.admin_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

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
