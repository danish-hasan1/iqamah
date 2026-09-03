import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import BottomNav from "@/components/BottomNav";
import InstallBanner from "@/components/InstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iqamah - Salah Timings",
  description: "Find masjids near you and get salah timing notifications",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Iqamah",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-teal-50 text-slate-900">
        <ServiceWorkerRegister />
        <div className="max-w-lg mx-auto w-full">
          <InstallBanner />
        </div>
        <main className="flex-1 pb-20 max-w-lg mx-auto w-full">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
