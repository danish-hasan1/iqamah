import * as SunCalc from "suncalc";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type SunTimes = {
  sunrise: Date;
  maghrib: Date;
  ishraq: Date;
  chasht: Date;
};

// Sun-based times only depend on the calendar date at the masjid's own
// location, not the viewer's — so "today" has to be read in the masjid's
// timezone, not the browser's or server's. toZonedTime/fromZonedTime encode
// the zoned wall-clock in a Date's *UTC* fields, so every read/write here
// uses the UTC accessors — that keeps this correct regardless of what
// timezone this code happens to be running in (browser or server).
function zonedYmd(timezone: string): { y: number; m: number; d: number } {
  const zonedNow = toZonedTime(new Date(), timezone);
  return { y: zonedNow.getUTCFullYear(), m: zonedNow.getUTCMonth(), d: zonedNow.getUTCDate() };
}

function todayAt(timezone: string, hour: number): Date {
  const { y, m, d } = zonedYmd(timezone);
  return fromZonedTime(new Date(Date.UTC(y, m, d, hour)), timezone);
}

/**
 * Sunrise, Maghrib (sunset), Ishraq, and Chasht for the masjid's location
 * today. Returns null in the (rare, high-latitude) case the sun doesn't
 * rise or set that day — there's nothing meaningful to show then.
 */
export function computeSunTimes(lat: number, lng: number, timezone: string): SunTimes | null {
  const noonGuess = todayAt(timezone, 12);
  const times = SunCalc.getTimes(noonGuess, lat, lng);
  if (!times.sunrise || !times.sunset || !times.solarNoon) return null;

  // Ishraq: the sun has fully risen, commonly taken as ~15-20 minutes after
  // sunrise (the "spear's length" rule of thumb).
  const ishraq = new Date(times.sunrise.getTime() + 20 * 60 * 1000);

  // Chasht/Duha: mid-morning, taken as roughly 60% of the way through the
  // forenoon (sunrise -> solar noon) — well within the accepted window and
  // clearly distinct from Ishraq.
  const forenoonMs = times.solarNoon.getTime() - times.sunrise.getTime();
  const chasht = new Date(times.sunrise.getTime() + forenoonMs * 0.6);

  return { sunrise: times.sunrise, maghrib: times.sunset, ishraq, chasht };
}

/**
 * Tahajjud (last third of the night), from tonight's Maghrib to tomorrow's
 * Fajr. Returns null if Fajr isn't set — there's no night to divide.
 */
export function computeTahajjud(
  lat: number,
  lng: number,
  timezone: string,
  fajrTime: string | null,
): Date | null {
  if (!fajrTime) return null;
  const [fh, fm] = fajrTime.slice(0, 5).split(":").map(Number);
  if (Number.isNaN(fh) || Number.isNaN(fm)) return null;

  const maghribToday = SunCalc.getTimes(todayAt(timezone, 12), lat, lng).sunset;
  if (!maghribToday) return null;

  const { y, m, d } = zonedYmd(timezone);
  const fajrTomorrow = fromZonedTime(new Date(Date.UTC(y, m, d + 1, fh, fm)), timezone);

  const nightMs = fajrTomorrow.getTime() - maghribToday.getTime();
  if (nightMs <= 0) return null;
  return new Date(fajrTomorrow.getTime() - nightMs / 3);
}

/** Formats a computed Date as "HH:MM" in the masjid's timezone (matches DB time strings). */
export function toHHMM(date: Date, timezone: string): string {
  return date.toLocaleTimeString("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
