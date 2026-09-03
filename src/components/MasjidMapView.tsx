"use client";

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function MasjidMapView({
  lat,
  lng,
  height = "220px",
}: {
  lat: number;
  lng: number;
  height?: string;
}) {
  return <MapPicker lat={lat} lng={lng} readOnly height={height} />;
}
