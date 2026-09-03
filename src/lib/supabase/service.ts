import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses Row Level Security entirely. Never import
// this from client components — it must only run in API routes / server code.
// Requires SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API →
// service_role secret), which is intentionally not a NEXT_PUBLIC_ var.
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
