"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef({ lat, lng });
  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      map.setView([lat, lng], map.getZoom());
      prev.current = { lat, lng };
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapPicker({
  lat,
  lng,
  onChange,
  height = "300px",
  readOnly = false,
}: {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  height?: string;
  readOnly?: boolean;
}) {
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-teal-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        dragging={!readOnly}
        scrollWheelZoom={!readOnly}
        doubleClickZoom={!readOnly}
        zoomControl={!readOnly}
        touchZoom={!readOnly}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          icon={icon}
          draggable={!readOnly}
          eventHandlers={
            readOnly
              ? undefined
              : {
                  dragend: (e) => {
                    const m = e.target as L.Marker;
                    const pos = m.getLatLng();
                    onChange?.(pos.lat, pos.lng);
                  },
                }
          }
        />
        {!readOnly && onChange && <ClickHandler onPick={onChange} />}
        <RecenterOnChange lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
