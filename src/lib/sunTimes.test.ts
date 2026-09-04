import { describe, expect, it } from "vitest";
import { computeSunTimes, computeTahajjud, toHHMM } from "./sunTimes";

// New York City, for a timezone clearly offset from UTC.
const LAT = 40.7128;
const LNG = -74.006;
const TZ = "America/New_York";

function sunTimesOrThrow() {
  const times = computeSunTimes(LAT, LNG, TZ);
  if (!times) throw new Error("expected sun times to be computable at this latitude");
  return times;
}

describe("computeSunTimes", () => {
  it("orders sunrise before ishraq before chasht before maghrib", () => {
    const { sunrise, maghrib, ishraq, chasht } = sunTimesOrThrow();
    expect(sunrise.getTime()).toBeLessThan(ishraq.getTime());
    expect(ishraq.getTime()).toBeLessThan(chasht.getTime());
    expect(chasht.getTime()).toBeLessThan(maghrib.getTime());
  });

  it("puts ishraq ~20 minutes after sunrise", () => {
    const { sunrise, ishraq } = sunTimesOrThrow();
    expect(ishraq.getTime() - sunrise.getTime()).toBe(20 * 60 * 1000);
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

  it("falls after tonight's maghrib and within a day of it", () => {
    const tahajjud = computeTahajjud(LAT, LNG, TZ, "05:30");
    expect(tahajjud).not.toBeNull();

    const { maghrib } = sunTimesOrThrow();
    expect(tahajjud!.getTime()).toBeGreaterThan(maghrib.getTime());
    expect(tahajjud!.getTime() - maghrib.getTime()).toBeLessThan(24 * 60 * 60 * 1000);
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
