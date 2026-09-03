"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <button
      className="text-base font-medium text-slate-500 underline shrink-0 min-h-11 px-1"
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
