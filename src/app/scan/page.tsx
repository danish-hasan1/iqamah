"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Starting camera...");

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleResult = useCallback(
    (text: string) => {
      stop();
      try {
        const url = new URL(text, window.location.origin);
        const match = url.pathname.match(/^\/masjid\/([^/]+)/);
        if (match) {
          router.push(`/masjid/${match[1]}`);
          return;
        }
      } catch {
        // not a URL, fall through
      }
      setError("That QR code isn't a valid Iqamah masjid code.");
      setStatus("");
    },
    [router, stop],
  );

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access isn't supported in this browser.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus("Point your camera at a masjid's QR code");

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        const tick = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code?.data) {
              handleResult(code.data);
              return;
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setError("Couldn't access the camera. Check camera permissions.");
      }
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [handleResult, stop]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-teal-800 pt-2 mb-4">Scan QR Code</h1>

      <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-8 border-2 border-white/70 rounded-2xl pointer-events-none" />
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {status && <p className="text-center text-sm text-slate-500 mt-4">{status}</p>}
      {error && (
        <div className="mt-4 text-center">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={() => router.push("/search")}
            className="text-teal-700 font-medium text-sm"
          >
            Search by name instead
          </button>
        </div>
      )}
    </div>
  );
}
