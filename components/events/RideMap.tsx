"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

/*
 * Leaflet risolve le icone marker di default via url() relativi che
 * si rompono sotto il bundler di Next (i file png non vengono serviti
 * dal path che Leaflet si aspetta). Usiamo dei divIcon inline invece
 * di importare gli asset png di leaflet/dist/images.
 */
function pin(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const originPin = pin("var(--primary)");
const venuePin = pin("#78716c");

type Props = {
  origin: {
    lat: number;
    lng: number;
    label: string;
  };
  venue?: {
    lat: number;
    lng: number;
    label: string;
  } | null;
};

export default function RideMap({ origin, venue }: Props) {
  const center: [number, number] = venue
    ? [(origin.lat + venue.lat) / 2, (origin.lng + venue.lng) / 2]
    : [origin.lat, origin.lng];

  return (
    <div className="mt-3 h-56 w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={center}
        zoom={venue ? 7 : 11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[origin.lat, origin.lng]} icon={originPin}>
          <Popup>{origin.label}</Popup>
        </Marker>

        {venue && (
          <Marker position={[venue.lat, venue.lng]} icon={venuePin}>
            <Popup>{venue.label}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
