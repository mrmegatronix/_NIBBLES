import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Layers, LocateFixed, Minus, Navigation, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NZ_SPOTS_125, type NzFishingSpot } from '@/data/nzSpots125';

type MapStyle = 'google-hybrid' | 'google-terrain' | 'google-road';

export function NibblesMap({
  selectedSpot,
  onSelectSpot,
  userCoords,
  onRequestGps,
}: {
  selectedSpot: NzFishingSpot;
  onSelectSpot: (spot: NzFishingSpot) => void;
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
  const [islandFilter, setIslandFilter] = useState<'all' | 'North Island' | 'South Island'>('all');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [selectedSpot.lat, selectedSpot.lng],
      zoom: 9,
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

    const visibleSpots =
      islandFilter === 'all' ? NZ_SPOTS_125 : NZ_SPOTS_125.filter((s) => s.island === islandFilter);

    visibleSpots.forEach((spot) => {
      const active = spot.id === selectedSpot.id;
      const m = L.circleMarker([spot.lat, spot.lng], {
        radius: active ? 10 : 6,
        color: '#ffffff',
        weight: active ? 3 : 1.5,
        fillColor: active ? '#22d3ee' : '#10b981',
        fillOpacity: 0.95,
      });
      m.bindTooltip(`${spot.name} (${spot.region})`, { direction: 'top' });
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
  }, [selectedSpot, userCoords, islandFilter, onSelectSpot]);

  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-display flex items-center gap-2 text-lg font-bold">
            <Compass className="h-5 w-5 text-primary" />
            Google Maps · All {NZ_SPOTS_125.length} NZ Fishing Spots
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'North Island', 'South Island'] as const).map((isl) => (
              <Button
                key={isl}
                size="xs"
                variant={islandFilter === isl ? 'default' : 'outline'}
                onClick={() => setIslandFilter(isl)}
              >
                {isl === 'all' ? 'All NZ (125)' : isl}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
            <Layers className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
            {[
              { id: 'google-hybrid', label: 'Google Satellite' },
              { id: 'google-terrain', label: 'Terrain' },
              { id: 'google-road', label: 'Road' },
            ].map((item) => (
              <Button
                key={item.id}
                size="xs"
                variant={mapStyle === item.id ? 'default' : 'ghost'}
                onClick={() => setMapStyle(item.id as MapStyle)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant={seamarks ? 'default' : 'outline'}
              onClick={() => setSeamarks((s) => !s)}
            >
              Nautical Seamarks
            </Button>
            <Button size="xs" onClick={onRequestGps} className="gap-1">
              <LocateFixed className="h-3.5 w-3.5" /> My GPS
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="relative overflow-hidden rounded-xl border bg-slate-950">
          <div ref={containerRef} className="z-0 h-[420px] w-full sm:h-[520px]" />
          <div className="absolute right-3 top-3 z-[400] flex flex-col gap-1.5">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 shadow-md"
              onClick={() => mapRef.current?.zoomIn()}
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 shadow-md"
              onClick={() => mapRef.current?.zoomOut()}
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 shadow-md"
              onClick={() => mapRef.current?.setView([selectedSpot.lat, selectedSpot.lng], 12)}
              aria-label="Center on spot"
            >
              <Navigation className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-mono">
            Active: {selectedSpot.name} ({selectedSpot.lat}, {selectedSpot.lng}) · {selectedSpot.region}
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.lat},${selectedSpot.lng}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Open in Google Maps →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
