"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGES } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-3 end-3 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white shadow-sm border border-teal-100 rounded-full px-3 py-1.5 text-xs font-medium text-teal-800"
      >
        {LANGUAGES.find((l) => l.code === lang)?.native}
      </button>
      {open && (
        <div className="mt-1 bg-white shadow-md border border-teal-100 rounded-lg overflow-hidden">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`block w-full text-start px-4 py-2 text-sm whitespace-nowrap ${
                lang === l.code
                  ? "bg-teal-50 text-teal-800 font-medium"
                  : "text-slate-600"
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
