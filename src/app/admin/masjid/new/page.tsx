"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LocationField from "@/components/LocationField";
import { slugify } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NewMasjidPage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(21.4225);
  const [lng, setLng] = useState(39.8262);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("masjids")
      .insert({
        name,
        address,
        lat,
        lng,
        slug: slugify(name),
        admin_id: user.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/admin/masjid/${data.id}`);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-teal-800 mb-5 pt-2">{t.newMasjid.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="new-masjid-name" className="text-base font-semibold text-slate-600">
            {t.newMasjid.name}
          </label>
          <input
            id="new-masjid-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full min-h-14 rounded-2xl border-2 border-slate-200 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label htmlFor="new-masjid-address" className="text-base font-semibold text-slate-600">
            {t.newMasjid.address}
          </label>
          <input
            id="new-masjid-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5 w-full min-h-14 rounded-2xl border-2 border-slate-200 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <span className="text-base font-semibold text-slate-600 mb-2 block">
            {t.newMasjid.location}
          </span>
          <LocationField lat={lat} lng={lng} onChange={(a, b) => (setLat(a), setLng(b))} />
        </div>

        {error && <p className="text-red-600 text-base">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t.newMasjid.creating : t.newMasjid.create}
        </button>
      </form>
    </div>
  );
}
