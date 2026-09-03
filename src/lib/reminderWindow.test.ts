import { describe, it, expect } from "vitest";
import { matchReminderWindow } from "./reminderWindow";

const WINDOW = 65;

describe("matchReminderWindow", () => {
  it("matches a prayer exactly now", () => {
    const r = matchReminderWindow(300, 300, WINDOW);
    expect(r.matches).toBe(true);
    expect(r.wrapped).toBe(false);
  });

  it("matches within the window", () => {
    const r = matchReminderWindow(300 + 60, 300, WINDOW);
    expect(r.matches).toBe(true);
  });

  it("does not match just outside the window", () => {
    const r = matchReminderWindow(300 + 66, 300, WINDOW);
    expect(r.matches).toBe(false);
  });

  it("does not match a prayer that hasn't happened yet today", () => {
    // now = 08:00 (480), prayer = 13:00 (780) — far in the future, not wrapped-past
    const r = matchReminderWindow(480, 780, WINDOW);
    expect(r.matches).toBe(false);
  });

  // The actual bug this was written to catch: Isha at 23:50, cron runs at
  // 00:05 the next day. Must match, and must report wrapped=true so the
  // caller uses *yesterday's* date for the dedupe key.
  it("matches and reports wrapped=true across local midnight", () => {
    const nowMinutes = 5; // 00:05
    const prayerMinutes = 23 * 60 + 50; // 23:50
    const r = matchReminderWindow(nowMinutes, prayerMinutes, WINDOW);
    expect(r.matches).toBe(true);
    expect(r.wrapped).toBe(true);
  });

  it("does not falsely wrap when now and prayer are on the same side of midnight", () => {
    const r = matchReminderWindow(300, 250, WINDOW);
    expect(r.wrapped).toBe(false);
  });

  it("does not match something 23 hours in the past (not a wraparound hit)", () => {
    // now = 00:05, prayer = 01:00 the previous day equivalent (i.e. 23 hours ago)
    const r = matchReminderWindow(5, 60, WINDOW);
    expect(r.matches).toBe(false);
  });
});
