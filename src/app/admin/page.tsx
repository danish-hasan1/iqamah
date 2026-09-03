import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Masjid } from "@/lib/types";
import AdminDashboardView from "@/components/AdminDashboardView";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: masjids } = await supabase
    .from("masjids")
    .select("*")
    .eq("admin_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AdminDashboardView email={user.email || ""} masjids={(masjids as Masjid[] | null) || []} />
  );
}
