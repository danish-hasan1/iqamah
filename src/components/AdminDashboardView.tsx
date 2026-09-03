"use client";

import Link from "next/link";
import type { Masjid } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminDashboardView({
  email,
  masjids,
}: {
  email: string;
  masjids: Masjid[];
}) {
  const { t } = useLanguage();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6 pt-2 gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-teal-800">{t.admin.dashboardTitle}</h1>
          <p className="text-sm text-slate-500 truncate">{email}</p>
        </div>
        <LogoutButton />
      </div>

      <Link href="/admin/masjid/new" className="btn-primary block mb-6">
        ➕ {t.admin.addMasjid}
      </Link>

      <div className="space-y-3">
        {masjids.map((m) => (
          <Link
            key={m.id}
            href={`/admin/masjid/${m.id}`}
            className="card block p-4 active:scale-[0.99] transition"
          >
            <div className="text-lg font-bold">{m.name}</div>
            <div className="text-base text-slate-500">{m.address || t.admin.noAddress}</div>
          </Link>
        ))}
        {masjids.length === 0 && (
          <p className="text-center text-slate-400 text-base py-10">{t.admin.noMasjids}</p>
        )}
      </div>
    </div>
  );
}
