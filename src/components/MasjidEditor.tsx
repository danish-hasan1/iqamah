"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import type { Masjid, PrayerKey } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const LocationField = dynamic(() => import("@/components/LocationField"), { ssr: false });

const PRAYERS: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "jumuah"];

export default function MasjidEditor({ masjid }: { masjid: Masjid }) {
  const { t } = useLanguage();
  const [name, setName] = useState(masjid.name);
  const [address, setAddress] = useState(masjid.address || "");
  const [lat, setLat] = useState(masjid.lat);
  const [lng, setLng] = useState(masjid.lng);
  const [times, setTimes] = useState<Record<PrayerKey, string>>({
    fajr: masjid.fajr || "",
    sunrise: masjid.sunrise || "",
    dhuhr: masjid.dhuhr || "",
    asr: masjid.asr || "",
    maghrib: masjid.maghrib || "",
    isha: masjid.isha || "",
    jumuah: masjid.jumuah || "",
  });
  const [notifyMessage, setNotifyMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/masjid/${masjid.slug}` : "";

  async function handleSave(notify: boolean) {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    const supabase = createClient();

    const timesChanged = PRAYERS.some((p) => (masjid[p] || "") !== times[p]);
    const customMessage = notifyMessage.trim();

    const { error } = await supabase
      .from("masjids")
      .update({
        name,
        address,
        lat,
        lng,
        ...times,
        updated_at: new Date().toISOString(),
      })
      .eq("id", masjid.id);

    if (error) {
      setSaving(false);
      setError(error.message);
      return;
    }

    if (notify && (timesChanged || customMessage)) {
      await fetch("/api/push/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId: masjid.id,
          masjidName: name,
          kind: "time_change",
          message: customMessage || `${name} updated their prayer timings.`,
        }),
      });
    }

    setSaving(false);
    setSavedMsg(t.editor.saved);
    setNotifyMessage("");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(t.editor.deleteConfirm)) return;
    const supabase = createClient();
    await supabase.from("masjids").delete().eq("id", masjid.id);
    router.push("/admin");
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-teal-800 pt-2">{masjid.name}</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-100 text-center">
        <p className="text-sm font-medium text-slate-600 mb-3">{t.editor.scanToOpen}</p>
        {publicUrl && (
          <div className="flex justify-center mb-3">
            <QRCodeSVG value={publicUrl} size={180} />
          </div>
        )}
        <a
          href={`/masjid/${masjid.slug}`}
          target="_blank"
          className="text-xs text-teal-700 break-all underline"
        >
          {publicUrl}
        </a>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-700">{t.editor.details}</h2>
        <div>
          <label className="text-sm font-medium text-slate-600">{t.editor.name}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">{t.editor.address}</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <LocationField lat={lat} lng={lng} onChange={(a, b) => (setLat(a), setLng(b))} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-700">{t.editor.prayerTimings}</h2>
        <div className="bg-white rounded-xl border border-teal-100 divide-y">
          {PRAYERS.map((p) => (
            <div key={p} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-medium text-slate-600">{t.prayer[p]}</span>
              <input
                type="time"
                value={times[p]}
                onChange={(e) => setTimes({ ...times, [p]: e.target.value })}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium text-slate-600">
          {t.editor.notificationMessage}
        </label>
        <textarea
          value={notifyMessage}
          onChange={(e) => setNotifyMessage(e.target.value)}
          placeholder={t.editor.notificationPlaceholder}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {savedMsg && <p className="text-teal-700 text-sm font-medium">{savedMsg}</p>}

      <div className="space-y-2">
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
        >
          {saving ? t.editor.saving : t.editor.saveNotify}
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="w-full bg-teal-50 text-teal-800 rounded-lg py-2.5 font-medium disabled:opacity-60"
        >
          {t.editor.saveQuiet}
        </button>
        <button
          onClick={handleDelete}
          className="w-full text-red-600 text-sm py-2 font-medium"
        >
          {t.editor.delete}
        </button>
      </div>
    </div>
  );
}
