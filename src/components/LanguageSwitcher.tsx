"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGES } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed z-50"
      style={{ top: "max(0.75rem, env(safe-area-inset-top))", insetInlineEnd: "0.75rem" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 bg-white shadow-md border border-teal-100 rounded-full pe-3 ps-2.5 py-2 min-h-11 text-sm font-semibold text-teal-800"
      >
        <span className="text-lg" aria-hidden="true">
          🌐
        </span>
        {LANGUAGES.find((l) => l.code === lang)?.native}
      </button>
      {open && (
        <div
          role="menu"
          className="mt-1.5 bg-white shadow-lg border border-teal-100 rounded-2xl overflow-hidden"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              role="menuitemradio"
              aria-checked={lang === l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`block w-full text-start px-5 py-3 min-h-12 text-base whitespace-nowrap ${
                lang === l.code
                  ? "bg-teal-50 text-teal-800 font-bold"
                  : "text-slate-600 font-medium"
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
