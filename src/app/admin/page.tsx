import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Masjid } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";

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
    <div className="p-4">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h1 className="text-xl font-bold text-teal-800">Your Masjids</h1>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <Link
        href="/admin/masjid/new"
        className="block w-full text-center bg-teal-700 text-white rounded-xl py-3 font-medium mb-6"
      >
        + Add a Masjid
      </Link>

      <div className="space-y-3">
        {(masjids as Masjid[] | null)?.map((m) => (
          <Link
            key={m.id}
            href={`/admin/masjid/${m.id}`}
            className="block bg-white rounded-xl p-4 shadow-sm border border-teal-100"
          >
            <div className="font-semibold">{m.name}</div>
            <div className="text-sm text-slate-500">{m.address || "No address set"}</div>
          </Link>
        ))}
        {masjids?.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">
            No masjids yet. Add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
