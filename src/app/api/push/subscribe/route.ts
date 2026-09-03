import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { deviceId, subscription } = await req.json();

  if (!deviceId || !subscription) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  await supabase.from("push_subscriptions").delete().eq("device_id", deviceId);
  return NextResponse.json({ ok: true });
}
