export type Masjid = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  admin_id: string;
  fajr: string | null;
  sunrise: string | null;
  dhuhr: string | null;
  asr: string | null;
  maghrib: string | null;
  isha: string | null;
  jumuah: string | null;
  fajr_iqamah: string | null;
  dhuhr_iqamah: string | null;
  asr_iqamah: string | null;
  maghrib_iqamah: string | null;
  isha_iqamah: string | null;
  notes: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type PrayerKey =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha"
  | "jumuah"
  | "ishraq"
  | "chasht"
  | "tahajjud";

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  jumuah: "Jumu'ah",
  ishraq: "Ishraq",
  chasht: "Chasht",
  tahajjud: "Tahajjud",
};

// The obligatory (fard) times the admin actually sets by hand — the
// congregation's iqamah schedule, which can carry a deliberate buffer past
// the raw astronomical time. Sunrise/Maghrib and the non-obligatory times
// (Ishraq/Chasht/Tahajjud) are computed automatically from the masjid's
// location instead, since they shift daily and aren't something an admin
// would want to keep re-entering — see src/lib/sunTimes.ts.
export const MANUAL_PRAYER_KEYS = [
  "fajr",
  "dhuhr",
  "asr",
  "isha",
  "jumuah",
] as const satisfies readonly PrayerKey[];

export type Follow = {
  id: string;
  device_id: string;
  masjid_id: string;
  tag: string;
  notify_salah: boolean;
  notify_time_change: boolean;
  created_at: string;
};

export const FOLLOW_TAGS = ["home", "work", "other"] as const;
export type FollowTag = (typeof FOLLOW_TAGS)[number];
