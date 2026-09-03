// Given "now" and a prayer time (both as minutes-since-midnight, local to
// the masjid's timezone), decides whether a reminder should fire and which
// calendar day the dedupe key should use.
//
// `wrapped` is true when the prayer fell on the *previous* calendar day
// relative to `nowMinutes` (e.g. prayer at 23:50, now is 00:05) — the
// dedupe key must use that earlier day, or the real reminder later on the
// new day gets silently skipped as a false duplicate (see cron route).
export function matchReminderWindow(
  nowMinutes: number,
  prayerMinutes: number,
  windowMinutes: number,
): { matches: boolean; wrapped: boolean; minutesSincePrayer: number } {
  const wrapped = nowMinutes < prayerMinutes;
  const minutesSincePrayer = (nowMinutes - prayerMinutes + 1440) % 1440;
  return {
    matches: minutesSincePrayer <= windowMinutes,
    wrapped,
    minutesSincePrayer,
  };
}
