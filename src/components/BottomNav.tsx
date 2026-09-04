"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const items = [
    { href: "/", label: t.nav.home, icon: "🏠" },
    { href: "/search", label: t.nav.search, icon: "🔍" },
    { href: "/scan", label: t.nav.scan, icon: "📷" },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-teal-100 max-w-lg mx-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex px-1 py-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 text-sm font-semibold min-h-16 justify-center"
            >
              <span
                aria-hidden="true"
                className={`flex items-center justify-center w-12 h-9 rounded-full text-xl leading-none transition-colors ${
                  active ? "bg-teal-100" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className={active ? "text-teal-800" : "text-slate-400"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
