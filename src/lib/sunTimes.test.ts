import { describe, expect, it } from "vitest";
import { computeSunTimes, computeTahajjud, toHHMM } from "./sunTimes";

// New York City, for a timezone clearly offset from UTC.
const LAT = 40.7128;
const LNG = -74.006;
const TZ = "America/New_York";

function sunTimesOrThrow(dhuhr: string | null = "13:00") {
  const times = computeSunTimes(LAT, LNG, TZ, dhuhr);
  if (!times) throw new Error("expected sun times to be computable at this latitude");
  return times;
}

describe("computeSunTimes", () => {
  it("orders sunrise -> ishraq -> chasht -> maghrib, each window non-overlapping", () => {
    const { sunrise, maghrib, ishraq, chasht } = sunTimesOrThrow();
    expect(sunrise.getTime()).toBeLessThan(ishraq.start.getTime());
    expect(ishraq.start.getTime()).toBeLessThan(ishraq.end.getTime());
    expect(ishraq.end.getTime()).toBe(chasht.start.getTime());
    expect(chasht.start.getTime()).toBeLessThan(chasht.end.getTime());
    expect(chasht.end.getTime()).toBeLessThan(maghrib.getTime());
  });

  it("starts ishraq ~20 minutes after sunrise", () => {
    const { sunrise, ishraq } = sunTimesOrThrow();
    expect(ishraq.start.getTime() - sunrise.getTime()).toBe(20 * 60 * 1000);
  });

  it("ends chasht 10 minutes before dhuhr when dhuhr is set", () => {
    const { chasht } = sunTimesOrThrow("13:00");
    expect(toHHMM(chasht.end, TZ)).toBe("12:50");
  });

  it("falls back to solar noon when dhuhr isn't set", () => {
    const withDhuhr = sunTimesOrThrow("13:00");
    const withoutDhuhr = sunTimesOrThrow(null);
    // Without a real dhuhr time, the window should still end sensibly
    // (before/around solar noon) rather than blowing up or picking a wildly
    // different hour.
    expect(withoutDhuhr.chasht.end.getTime()).not.toBe(withDhuhr.chasht.end.getTime());
    expect(withoutDhuhr.ishraq.start.getTime()).toBeLessThan(withoutDhuhr.chasht.end.getTime());
  });

  it("produces a plausible local sunrise hour", () => {
    const { sunrise } = sunTimesOrThrow();
    const hhmm = toHHMM(sunrise, TZ);
    const [h] = hhmm.split(":").map(Number);
    expect(h).toBeGreaterThanOrEqual(4);
    expect(h).toBeLessThanOrEqual(8);
  });
});

describe("computeTahajjud", () => {
  it("returns null when fajr isn't set", () => {
    expect(computeTahajjud(LAT, LNG, TZ, null)).toBeNull();
  });

  it("returns a window ending exactly at tomorrow's fajr", () => {
    const window = computeTahajjud(LAT, LNG, TZ, "05:30");
    expect(window).not.toBeNull();
    expect(toHHMM(window!.end, TZ)).toBe("05:30");
    expect(window!.start.getTime()).toBeLessThan(window!.end.getTime());
  });

  it("starts after tonight's maghrib and within a day of it", () => {
    const window = computeTahajjud(LAT, LNG, TZ, "05:30");
    expect(window).not.toBeNull();

    const { maghrib } = sunTimesOrThrow();
    expect(window!.start.getTime()).toBeGreaterThan(maghrib.getTime());
    expect(window!.start.getTime() - maghrib.getTime()).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it("returns null for an unparseable fajr time", () => {
    expect(computeTahajjud(LAT, LNG, TZ, "not-a-time")).toBeNull();
  });
});

describe("toHHMM", () => {
  it("formats in HH:MM 24-hour form", () => {
    const d = new Date(Date.UTC(2026, 0, 1, 10, 5));
    expect(toHHMM(d, "UTC")).toMatch(/^\d{2}:\d{2}$/);
  });
});
