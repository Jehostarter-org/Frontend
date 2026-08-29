"use client";

import { useEffect, useRef, useState } from "react";

interface RouteMapProps {
  pickupLat: number;
  pickupLng: number;
  pickupLabel?: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffLabel?: string;
  driverLat?: number;
  driverLng?: number;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let L: any = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function fetchRoute(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number,
): Promise<[number, number][] | null> {
  const qs = new URLSearchParams({
    pickup_lat: String(pickupLat),
    pickup_lon: String(pickupLng),
    dropoff_lat: String(dropoffLat),
    dropoff_lon: String(dropoffLng),
  });

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}/api/services/route/?${qs}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.coordinates && Array.isArray(data.coordinates) && data.coordinates.length >= 2) {
      return data.coordinates as [number, number][];
    }
    return null;
  } catch (err) {
    console.error("Route fetch failed:", err);
    return null;
  }
}

export default function RouteMap({
  pickupLat, pickupLng, pickupLabel,
  dropoffLat, dropoffLng, dropoffLabel,
  driverLat, driverLng,
  className = "",
}: RouteMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof initMap> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || mapRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        if (!L) L = await import("leaflet");
        if (cancelled || !elRef.current || mapRef.current) return;
        if ((elRef.current as any)._leaflet_id) return;
        mapRef.current = initMap(elRef.current, {
          pickupLat, pickupLng, pickupLabel,
          dropoffLat, dropoffLng, dropoffLabel,
          driverLat, driverLng,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Leaflet init error:", err);
          setError(err instanceof Error ? err.message : "Failed to load map");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapRef.current?.update({
      pickupLat, pickupLng, pickupLabel,
      dropoffLat, dropoffLng, dropoffLabel,
      driverLat, driverLng,
    });
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng, pickupLabel, dropoffLabel]);

  // Fetch the real road route (Uber-style) once we have both points
  useEffect(() => {
    let cancelled = false;
    if (
      pickupLat == null || pickupLng == null ||
      dropoffLat == null || dropoffLng == null
    ) {
      setRoute(null);
      return;
    }
    fetchRoute(pickupLat, pickupLng, dropoffLat, dropoffLng).then((coords) => {
      if (!cancelled) {
        setRoute(coords);
        mapRef.current?.setRoute(coords);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  if (error) {
    return (
      <div className="w-full h-full bg-[#e5e3df] flex items-center justify-center">
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  return <div ref={elRef} className={`w-full h-full ${className}`} />;
}

function initMap(
  el: HTMLElement,
  opts: RouteMapProps,
) {
  const map = L.map(el, {
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 200);

  const state = {
    opts,
    route: null as [number, number][] | null,
  };

  const renderAll = () => render(map, state);

  const instance = {
    map,
    update: (o: RouteMapProps) => {
      state.opts = o;
      renderAll();
    },
    setRoute: (r: [number, number][] | null) => {
      state.route = r;
      renderAll();
    },
  };
  renderAll();
  return instance;
}

function render(
  map: ReturnType<typeof L.map>,
  state: { opts: RouteMapProps; route: [number, number][] | null },
) {
  const { opts, route } = state;
  const { pickupLat, pickupLng, pickupLabel,
          dropoffLat, dropoffLng, dropoffLabel,
          driverLat, driverLng } = opts;

  map.eachLayer((layer: any) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  const pickupIcon = L.divIcon({
    html: `<div style="background:#059669;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">${pickupLabel || "Pickup"}</div>`,
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  const dropoffIcon = L.divIcon({
    html: `<div style="background:#dc2626;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">${dropoffLabel || "Drop-off"}</div>`,
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map);
  L.marker([dropoffLat, dropoffLng], { icon: dropoffIcon }).addTo(map);

  // Uber-style road route when available, dashed straight line as fallback
  const hasRoute = route && route.length >= 2;
  const line = hasRoute
    ? route.map((p) => [p[0], p[1]])
    : [[pickupLat, pickupLng], [dropoffLat, dropoffLng]];

  L.polyline(line, hasRoute
    ? { color: "#2563eb", weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round" }
    : { color: "#2563eb", weight: 3, opacity: 0.6, dashArray: "8 8" },
  ).addTo(map);

  if (driverLat !== undefined && driverLng !== undefined) {
    const driverIcon = L.divIcon({
      html: `<div style="background:#2563eb;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(37,99,235,.5);border:2px solid white">🚗</div>`,
      className: "",
      iconSize: [0, 0],
      iconAnchor: [14, 14],
    });
    L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map);
  }

  const bounds = L.latLngBounds(
    [pickupLat, pickupLng],
    [dropoffLat, dropoffLng],
  );
  if (driverLat !== undefined && driverLng !== undefined) {
    bounds.extend([driverLat, driverLng]);
  }
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
}
