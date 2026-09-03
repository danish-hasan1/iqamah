import { describe, it, expect } from "vitest";
import { slugify, formatTime, distanceKm } from "./utils";

describe("slugify", () => {
  it("lowercases and hyphenates a normal name", () => {
    const slug = slugify("Masjid Al Noor");
    expect(slug).toMatch(/^masjid-al-noor-[a-z0-9-]+$/);
  });

  it("strips punctuation", () => {
    const slug = slugify("St. Mary's Masjid!!");
    expect(slug).toMatch(/^st-marys-masjid-[a-z0-9-]+$/);
  });

  it("falls back to a generic base for non-Latin names instead of a bare suffix", () => {
    const slug = slugify("مسجد النور");
    // must not start with a hyphen (i.e. not just "-xxxx")
    expect(slug.startsWith("-")).toBe(false);
    expect(slug).toMatch(/^masjid-[a-z0-9-]+$/);
  });

  it("falls back to a generic base for an empty name", () => {
    const slug = slugify("   ");
    expect(slug.startsWith("-")).toBe(false);
    expect(slug).toMatch(/^masjid-[a-z0-9-]+$/);
  });

  it("produces different slugs for the same name (collision resistance)", () => {
    const a = slugify("Masjid Al Noor");
    const b = slugify("Masjid Al Noor");
    expect(a).not.toBe(b);
  });

  it("collapses repeated whitespace/hyphens and trims edges", () => {
    const slug = slugify("  Al   Noor -- Masjid  ");
    expect(slug).toMatch(/^al-noor-masjid-[a-z0-9-]+$/);
  });
});

describe("formatTime", () => {
  it("formats midnight as 12:00 AM", () => {
    expect(formatTime("00:00")).toBe("12:00 AM");
  });

  it("formats noon as 12:00 PM", () => {
    expect(formatTime("12:00")).toBe("12:00 PM");
  });

  it("formats a morning time", () => {
    expect(formatTime("05:30")).toBe("5:30 AM");
  });

  it("formats an evening time", () => {
    expect(formatTime("20:30")).toBe("8:30 PM");
  });

  it("returns a placeholder for null", () => {
    expect(formatTime(null)).toBe("--:--");
  });

  it("pads single-digit minutes", () => {
    expect(formatTime("14:05")).toBe("2:05 PM");
  });
});

describe("distanceKm", () => {
  it("returns ~0 for the same point", () => {
    expect(distanceKm(21.4225, 39.8262, 21.4225, 39.8262)).toBeCloseTo(0, 5);
  });

  it("computes a known distance (Mecca to Medina, ~340km great-circle)", () => {
    const d = distanceKm(21.4225, 39.8262, 24.5247, 39.5692);
    expect(d).toBeGreaterThan(330);
    expect(d).toBeLessThan(350);
  });

  it("is symmetric", () => {
    const a = distanceKm(21.4225, 39.8262, 24.5247, 39.5692);
    const b = distanceKm(24.5247, 39.5692, 21.4225, 39.8262);
    expect(a).toBeCloseTo(b, 9);
  });
});
