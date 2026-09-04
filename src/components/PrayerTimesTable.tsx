"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import { computeSunTimes, computeTahajjud, toHHMM } from "@/lib/sunTimes";
import type { Masjid, PrayerKey } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const OBLIGATORY_ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const NAWAFIL_ORDER: PrayerKey[] = ["sunrise", "ishraq", "chasht", "tahajjud"];

const ICON: Record<PrayerKey, string> = {
  fajr: "🌅",
  sunrise: "☀️",
  dhuhr: "🌞",
  asr: "🌤️",
  maghrib: "🌇",
  isha: "🌙",
  jumuah: "🕌",
  ishraq: "🌄",
  chasht: "🌻",
  tahajjud: "🌌",
};

function nextObligatoryPrayer(
  masjid: Masjid,
  times: Record<string, string | null>,
): PrayerKey | null {
  const nowLocal = new Date().toLocaleTimeString("en-GB", {
    timeZone: masjid.timezone || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const upcoming = OBLIGATORY_ORDER.find((p) => times[p] && times[p]!.slice(0, 5) > nowLocal);
  return upcoming || OBLIGATORY_ORDER.find((p) => times[p]) || null;
}

export default function PrayerTimesTable({ masjid }: { masjid: Masjid }) {
  const { t } = useLanguage();
  // Both the sun-based times and `next` depend on wall-clock time, not just
  // props, so they're computed fresh on every render rather than synced via
  // an effect; the interval below exists only to force a re-render once a
  // minute so they stay current.
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const timezone = masjid.timezone || "UTC";
  const sunTimes = computeSunTimes(masjid.lat, masjid.lng, timezone);
  const tahajjud = computeTahajjud(masjid.lat, masjid.lng, timezone, masjid.fajr);

  const obligatoryTimes: Record<string, string | null> = {
    fajr: masjid.fajr,
    dhuhr: masjid.dhuhr,
    asr: masjid.asr,
    maghrib: sunTimes ? toHHMM(sunTimes.maghrib, timezone) : null,
    isha: masjid.isha,
  };
  const nawafilTimes: Record<string, string | null> = {
    sunrise: sunTimes ? toHHMM(sunTimes.sunrise, timezone) : null,
    ishraq: sunTimes ? toHHMM(sunTimes.ishraq, timezone) : null,
    chasht: sunTimes ? toHHMM(sunTimes.chasht, timezone) : null,
    tahajjud: tahajjud ? toHHMM(tahajjud, timezone) : null,
  };

  const next = nextObligatoryPrayer(masjid, obligatoryTimes);
  const hasJumuah = !!masjid.jumuah;

  return (
    <div className="space-y-4">
      <div className="card divide-y divide-teal-100/80 overflow-hidden">
        {OBLIGATORY_ORDER.filter((p) => obligatoryTimes[p]).map((p) => (
          <PrayerRow key={p} label={t.prayer[p]} icon={ICON[p]} time={obligatoryTimes[p]}
            isNext={p === next} nextLabel={t.masjid.next} />
        ))}
        {hasJumuah && (
          <PrayerRow
            label={t.prayer.jumuah}
            icon={ICON.jumuah}
            time={masjid.jumuah}
            isNext={false}
            nextLabel={t.masjid.next}
          />
        )}
        {OBLIGATORY_ORDER.every((p) => !obligatoryTimes[p]) && !hasJumuah && (
          <p className="text-center text-slate-400 text-base py-6">{t.masjid.timingsNotSet}</p>
        )}
      </div>

      {NAWAFIL_ORDER.some((p) => nawafilTimes[p]) && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 px-1 mb-2">
            {t.masjid.nawafilHeading}
          </h3>
          <div className="card divide-y divide-teal-100/80 overflow-hidden opacity-90">
            {NAWAFIL_ORDER.filter((p) => nawafilTimes[p]).map((p) => (
              <PrayerRow
                key={p}
                label={t.prayer[p]}
                icon={ICON[p]}
                time={nawafilTimes[p]}
                isNext={false}
                nextLabel={t.masjid.next}
                compact
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 px-1 mt-1.5">{t.masjid.nawafilNote}</p>
        </div>
      )}
    </div>
  );
}

function PrayerRow({
  label,
  icon,
  time,
  isNext,
  nextLabel,
  compact,
}: {
  label: string;
  icon: string;
  time: string | null;
  isNext: boolean;
  nextLabel: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-5 ${compact ? "py-3" : "py-4"} ${
        isNext ? "bg-teal-50" : ""
      }`}
    >
      <span className="flex items-center gap-3 min-w-0">
        <span className={`${compact ? "text-2xl" : "text-3xl"} leading-none shrink-0`}>
          {icon}
        </span>
        <span className="flex flex-col min-w-0">
          <span
            className={`${compact ? "text-base" : "text-lg"} font-semibold text-slate-700 truncate`}
          >
            {label}
          </span>
          {isNext && (
            <span className="text-sm font-bold uppercase tracking-wide text-gold-600 w-fit">
              {nextLabel}
            </span>
          )}
        </span>
      </span>
      <span
        className={`${compact ? "text-xl" : "text-2xl"} font-bold tabular-nums shrink-0 ${
          isNext ? "text-teal-800" : "text-slate-600"
        }`}
      >
        {formatTime(time)}
      </span>
    </div>
  );
}
