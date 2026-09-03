"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <button
      className="text-sm text-slate-500 underline"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      {t.admin.logout}
    </button>
  );
}
