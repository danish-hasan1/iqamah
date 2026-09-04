import * as SunCalc from "suncalc";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type TimeWindow = { start: Date; end: Date };

export type SunTimes = {
  sunrise: Date;
  maghrib: Date;
  ishraq: TimeWindow;
  chasht: TimeWindow;
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

function hhmmToMinutes(time: string): number | null {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Sunrise, Maghrib (sunset), Ishraq, and Chasht (Duha) windows for the
 * masjid's location today. Returns null in the (rare, high-latitude) case
 * the sun doesn't rise or set that day — there's nothing meaningful to show
 * then.
 *
 * The forenoon nafl period (sunrise -> just before Dhuhr) is split into two
 * back-to-back windows: Ishraq covers the first half, Chasht the second —
 * a simple, defensible way to give both a distinct start and end time
 * rather than a single instant.
 */
export function computeSunTimes(
  lat: number,
  lng: number,
  timezone: string,
  dhuhrTime: string | null,
): SunTimes | null {
  const noonGuess = todayAt(timezone, 12);
  const times = SunCalc.getTimes(noonGuess, lat, lng);
  if (!times.sunrise || !times.sunset || !times.solarNoon) return null;

  // The nafl window opens once the sun has fully risen, commonly taken as
  // ~15-20 minutes after sunrise (the "spear's length" rule of thumb).
  const forenoonStart = new Date(times.sunrise.getTime() + 20 * 60 * 1000);

  // It closes shortly before Dhuhr (falling back to solar noon if Dhuhr
  // isn't set), since prayer isn't offered right as the sun peaks.
  const dhuhrMinutes = dhuhrTime ? hhmmToMinutes(dhuhrTime) : null;
  let forenoonEnd = new Date(times.solarNoon.getTime());
  if (dhuhrMinutes !== null) {
    const { y, m, d } = zonedYmd(timezone);
    forenoonEnd = fromZonedTime(
      new Date(Date.UTC(y, m, d, Math.floor(dhuhrMinutes / 60), dhuhrMinutes % 60)),
      timezone,
    );
  }
  const forenoonEndMinus10 = new Date(forenoonEnd.getTime() - 10 * 60 * 1000);

  const midpoint = new Date(
    (forenoonStart.getTime() + forenoonEndMinus10.getTime()) / 2,
  );

  const ishraq: TimeWindow = { start: forenoonStart, end: midpoint };
  const chasht: TimeWindow = { start: midpoint, end: forenoonEndMinus10 };

  return { sunrise: times.sunrise, maghrib: times.sunset, ishraq, chasht };
}

/**
 * Tahajjud window (the last third of the night), from the start of the
 * last third to tomorrow's Fajr. Returns null if Fajr isn't set — there's
 * no night to divide.
 */
export function computeTahajjud(
  lat: number,
  lng: number,
  timezone: string,
  fajrTime: string | null,
): TimeWindow | null {
  if (!fajrTime) return null;
  const fajrMinutes = hhmmToMinutes(fajrTime);
  if (fajrMinutes === null) return null;

  const maghribToday = SunCalc.getTimes(todayAt(timezone, 12), lat, lng).sunset;
  if (!maghribToday) return null;

  const { y, m, d } = zonedYmd(timezone);
  const fajrTomorrow = fromZonedTime(
    new Date(Date.UTC(y, m, d + 1, Math.floor(fajrMinutes / 60), fajrMinutes % 60)),
    timezone,
  );

  const nightMs = fajrTomorrow.getTime() - maghribToday.getTime();
  if (nightMs <= 0) return null;
  const start = new Date(fajrTomorrow.getTime() - nightMs / 3);
  return { start, end: fajrTomorrow };
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
