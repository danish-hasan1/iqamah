"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device";
import { ensurePushSubscription } from "@/lib/push";
import { FOLLOW_TAGS, type Follow, type FollowTag } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Toggle from "@/components/Toggle";

const TAG_ICON: Record<FollowTag, string> = { home: "🏡", work: "🏢", other: "📍" };

export default function FollowPanel({ masjidId }: { masjidId: string }) {
  const { t } = useLanguage();
  const TAG_LABEL: Record<FollowTag, string> = {
    home: t.home.tagHome,
    work: t.home.tagWork,
    other: t.home.tagOther,
  };
  const [follow, setFollow] = useState<Follow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("device_id", deviceId)
        .eq("masjid_id", masjidId)
        .maybeSingle();
      if (error) setError(t.follow.genericError);
      setFollow(data);
      setLoading(false);

      // Backfill: older follows may have notifications "on" from before a
      // push subscription was required for it, so make sure one exists.
      if (data && (data.notify_time_change || data.notify_salah)) {
        ensurePushSubscription().catch(() => {});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masjidId]);

  async function toggleFollow() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const deviceId = getDeviceId();

    if (follow) {
      const { error } = await supabase.from("follows").delete().eq("id", follow.id);
      if (error) {
        setError(t.follow.genericError);
        setBusy(false);
        return;
      }
      setFollow(null);
      setBusy(false);
      return;
    }

    // notify_time_change defaults on, so a push subscription is needed up
    // front — otherwise the toggle looks "on" with nothing to deliver to.
    let subscribed = false;
    try {
      subscribed = await ensurePushSubscription();
    } catch {
      subscribed = false;
    }
    if (!subscribed) setPermissionDenied(true);

    const { data, error } = await supabase
      .from("follows")
      .insert({
        device_id: deviceId,
        masjid_id: masjidId,
        tag: "other",
        notify_time_change: subscribed,
        notify_salah: false,
      })
      .select()
      .single();
    if (error) {
      setError(t.follow.genericError);
      setBusy(false);
      return;
    }
    setFollow(data);
    setBusy(false);
  }

  async function updateFollow(patch: Partial<Follow>) {
    if (!follow) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();

    if (patch.notify_salah || patch.notify_time_change) {
      let ok = false;
      try {
        ok = await ensurePushSubscription();
      } catch {
        ok = false;
      }
      if (!ok) {
        setPermissionDenied(true);
        setBusy(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("follows")
      .update(patch)
      .eq("id", follow.id)
      .select()
      .single();
    if (error) {
      setError(t.follow.genericError);
      setBusy(false);
      return;
    }
    setFollow(data);
    setBusy(false);
  }

  if (loading) return <div className="h-24" />;

  return (
    <div className="card p-4 space-y-4">
      <button
        onClick={toggleFollow}
        disabled={busy}
        className={follow ? "btn-secondary" : "btn-primary"}
      >
        {follow ? t.follow.saved : t.follow.save}
      </button>

      {error && <p className="text-base text-red-500">{error}</p>}

      {follow && (
        <>
          <div>
            <p className="text-base font-semibold text-slate-600 mb-2">{t.follow.tagAs}</p>
            <div className="flex gap-2">
              {FOLLOW_TAGS.map((tag: FollowTag) => (
                <button
                  key={tag}
                  onClick={() => updateFollow({ tag })}
                  className={`flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 min-h-16 text-base font-semibold border-2 transition ${
                    follow.tag === tag
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  <span className="text-2xl leading-none">{TAG_ICON[tag]}</span>
                  {TAG_LABEL[tag]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="flex items-center gap-2 text-base text-slate-700">
                <span className="text-xl">🔔</span>
                {t.follow.notifyTimeChange}
              </span>
              <Toggle
                checked={follow.notify_time_change}
                onChange={(v) => updateFollow({ notify_time_change: v })}
                label={t.follow.notifyTimeChange}
              />
            </div>
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="flex items-center gap-2 text-base text-slate-700">
                <span className="text-xl">🕌</span>
                {t.follow.notifySalah}
              </span>
              <Toggle
                checked={follow.notify_salah}
                onChange={(v) => updateFollow({ notify_salah: v })}
                label={t.follow.notifySalah}
              />
            </div>
            {permissionDenied && (
              <p className="text-sm text-red-500">{t.follow.permissionDenied}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
