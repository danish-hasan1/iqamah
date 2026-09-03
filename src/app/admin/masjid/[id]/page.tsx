import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Masjid } from "@/lib/types";
import MasjidEditor from "@/components/MasjidEditor";

export default async function EditMasjidPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: masjid } = await supabase
    .from("masjids")
    .select("*")
    .eq("id", id)
    .single();

  if (!masjid) notFound();
  if ((masjid as Masjid).admin_id !== user.id) redirect("/admin");

  return <MasjidEditor masjid={masjid as Masjid} />;
}
