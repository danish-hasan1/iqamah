import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

function isValidSubscription(sub: unknown): sub is {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} {
  if (!sub || typeof sub !== "object") return false;
  const s = sub as Record<string, unknown>;
  if (typeof s.endpoint !== "string" || !s.endpoint.startsWith("https://")) return false;
  if (!s.keys || typeof s.keys !== "object") return false;
  const keys = s.keys as Record<string, unknown>;
  return typeof keys.p256dh === "string" && typeof keys.auth === "string";
}

export async function POST(req: NextRequest) {
  const { deviceId, subscription } = await req.json();

  if (typeof deviceId !== "string" || !deviceId || !isValidSubscription(subscription)) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ device_id: deviceId, subscription }, { onConflict: "device_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { deviceId } = await req.json();
  if (typeof deviceId !== "string" || !deviceId) {
    return NextResponse.json({ error: "missing deviceId" }, { status: 400 });
  }
  const supabase = createServiceClient();
  await supabase.from("push_subscriptions").delete().eq("device_id", deviceId);
  return NextResponse.json({ ok: true });
}
