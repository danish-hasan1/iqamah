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

  // Tracks what's actually persisted in the DB, updated synchronously after
  // each successful save. Comparing against this (rather than the `masjid`
  // prop, which only updates once router.refresh() re-renders from the
  // server) avoids a stale-baseline race: saving twice in quick succession
  // no longer looks like a "time change" on the second save when nothing
  // actually changed since the first.
  const [lastSaved, setLastSaved] = useState<Record<PrayerKey, string>>(times);

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/masjid/${masjid.slug}` : "";

  async function handleSave(notify: boolean) {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    const supabase = createClient();

    const timesChanged = PRAYERS.some((p) => lastSaved[p] !== times[p]);
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

    setLastSaved(times);

    if (notify && (timesChanged || customMessage)) {
      const res = await fetch("/api/push/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId: masjid.id,
          masjidName: name,
          kind: "time_change",
          message: customMessage || `${name} updated their prayer timings.`,
        }),
      });
      if (!res.ok) {
        setSaving(false);
        setError(t.editor.notifyFailed);
        return;
      }
    }

    setSaving(false);
    setSavedMsg(t.editor.saved);
    setNotifyMessage("");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(t.editor.deleteConfirm)) return;
    const supabase = createClient();
    const { error } = await supabase.from("masjids").delete().eq("id", masjid.id);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-teal-800 pt-2">{masjid.name}</h1>

      <div className="card p-4 text-center">
        <p className="text-sm font-medium text-slate-600 mb-3">{t.editor.scanToOpen}</p>
        {publicUrl && (
          <div className="flex justify-center mb-3 p-3 bg-teal-50 rounded-xl inline-block mx-auto">
            <QRCodeSVG value={publicUrl} size={180} fgColor="#0a5347" />
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
          <label htmlFor="masjid-name" className="text-sm font-medium text-slate-600">
            {t.editor.name}
          </label>
          <input
            id="masjid-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label htmlFor="masjid-address" className="text-sm font-medium text-slate-600">
            {t.editor.address}
          </label>
          <input
            id="masjid-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <LocationField lat={lat} lng={lng} onChange={(a, b) => (setLat(a), setLng(b))} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-700">{t.editor.prayerTimings}</h2>
        <div className="card divide-y divide-teal-100/80">
          {PRAYERS.map((p) => (
            <div key={p} className="flex items-center justify-between px-4 py-2.5">
              <label htmlFor={`prayer-${p}`} className="text-sm font-medium text-slate-600">
                {t.prayer[p]}
              </label>
              <input
                id={`prayer-${p}`}
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
        <label htmlFor="notify-message" className="text-sm font-medium text-slate-600">
          {t.editor.notificationMessage}
        </label>
        <textarea
          id="notify-message"
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
        <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary">
          {saving ? t.editor.saving : t.editor.saveNotify}
        </button>
        <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary">
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
