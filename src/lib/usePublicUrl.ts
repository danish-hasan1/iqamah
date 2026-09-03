"use client";

import { useEffect, useState } from "react";

// window.location.origin is unavailable during SSR, so computing it directly
// in the render body (`typeof window !== "undefined" ? ... : ""`) makes the
// client's very first render differ from the server-rendered HTML — a real
// hydration mismatch. Deferring to an effect keeps the first client render
// matching the server (both show ""), then fills it in post-mount.
export function usePublicUrl(path: string): string {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  return url;
}
