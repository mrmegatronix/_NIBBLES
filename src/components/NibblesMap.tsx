import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Layers, LocateFixed, Minus, Navigation, Plus } from 'lucide-react';
import { NIBBLES_SPOTS, type NibblesSpot } from '@/data/spots';

type MapStyle = 'google-hybrid' | 'google-terrain' | 'google-road';

export function NibblesMap({
  selectedSpot,
  onSelectSpot,
  userCoords,
  onRequestGps,
}: {
  selectedSpot: NibblesSpot;
  onSelectSpot: (spot: NibblesSpot) => void;
  userCoords: { lat: number; lng: number } | null;
  onRequestGps: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const seamarkRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>('google-hybrid');
  const [seamarks, setSeamarks] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [selectedSpot.lat, selectedSpot.lng],
      zoom: 12,
      zoomControl: false,
    });
    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseRef.current) map.removeLayer(baseRef.current);
    const urls: Record<MapStyle, string> = {
      'google-hybrid': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      'google-terrain': 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      'google-road': 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    };
    baseRef.current = L.tileLayer(urls[mapStyle], {
      attribution: 'Map data &copy; Google',
      maxZoom: 20,
    }).addTo(map);

    if (seamarkRef.current) {
      map.removeLayer(seamarkRef.current);
      seamarkRef.current = null;
    }
    if (seamarks) {
      seamarkRef.current = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.9,
      }).addTo(map);
    }
  }, [mapStyle, seamarks]);

  useEffect(() => {
    mapRef.current?.panTo([selectedSpot.lat, selectedSpot.lng], { animate: true });
  }, [selectedSpot]);

  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    NIBBLES_SPOTS.forEach((spot) => {
      const active = spot.id === selectedSpot.id;
      const m = L.circleMarker([spot.lat, spot.lng], {
        radius: active ? 11 : 7,
        color: '#ffffff',
        weight: active ? 3 : 2,
        fillColor: active ? '#22d3ee' : '#10b981',
        fillOpacity: 0.95,
      });
      m.bindTooltip(`${spot.name} (${spot.depthRange})`, { direction: 'top' });
      m.on('click', () => onSelectSpot(spot));
      m.addTo(group);
    });

    if (userCoords) {
      L.circleMarker([userCoords.lat, userCoords.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 1,
      })
        .bindPopup('Your GPS Location')
        .addTo(group);
    }
  }, [selectedSpot, userCoords, onSelectSpot]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1">
          <Layers className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
          {[
            { id: 'google-hybrid', label: 'Google Satellite' },
            { id: 'google-terrain', label: 'Terrain' },
            { id: 'google-road', label: 'Road' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMapStyle(item.id as MapStyle)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                mapStyle === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSeamarks((s) => !s)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              seamarks ? 'border-primary bg-primary/15 text-primary' : 'bg-card'
            }`}
          >
            Nautical Seamarks
          </button>
          <button
            type="button"
            onClick={onRequestGps}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            My GPS
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border bg-slate-950">
        <div ref={containerRef} className="z-0 h-[360px] w-full sm:h-[460px]" />
        <div className="absolute right-3 top-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card/90 shadow-md backdrop-blur"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card/90 shadow-md backdrop-blur"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.setView([selectedSpot.lat, selectedSpot.lng], 13)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card/90 shadow-md backdrop-blur"
            aria-label="Center on spot"
          >
            <Navigation className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-primary" />
          {selectedSpot.name} ({selectedSpot.lat}, {selectedSpot.lng})
        </span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.lat},${selectedSpot.lng}`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  );
}
