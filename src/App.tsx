import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Compass,
  Fish,
  LayoutDashboard,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { BlinkingClock } from '@/components/BlinkingClock';
import { FishingMatrixTable } from '@/components/FishingMatrixTable';
import { NibblesMap } from '@/components/NibblesMap';
import { SevenDayCalendarCard } from '@/components/SevenDayCalendarCard';
import { SolunarClockCard } from '@/components/SolunarClockCard';
import { SpotCombobox } from '@/components/SpotCombobox';
import { TideSolunarChart } from '@/components/TideSolunarChart';
import { TrendGraphsSection } from '@/components/TrendGraphsSection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DEFAULT_SPOT, NZ_SPOTS_125, type NzFishingSpot } from '@/data/nzSpots125';
import { fetchSpotForecast, type SpotForecastBundle } from '@/lib/liveForecast';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('forecast');
  const [selectedSpot, setSelectedSpot] = useState<NzFishingSpot>(DEFAULT_SPOT);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const [bundle, setBundle] = useState<SpotForecastBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const loadSpot = useCallback(async (spot: NzFishingSpot) => {
    setLoading(true);
    setError(null);
    setActiveDayIndex(0);
    try {
      const live = await fetchSpotForecast(spot);
      setBundle(live);
    } catch (err) {
      setBundle(null);
      setError(err instanceof Error ? err.message : 'Unable to fetch live forecast');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpot(selectedSpot);
  }, [selectedSpot, loadSpot]);

  const locateNearestSpot = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setUserCoords({ lat, lng });
        let nearest = NZ_SPOTS_125[0];
        let minDist = Infinity;
        for (const s of NZ_SPOTS_125) {
          const d = haversineKm(lat, lng, s.lat, s.lng);
          if (d < minDist) {
            minDist = d;
            nearest = s;
          }
        }
        setSelectedSpot(nearest);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background pb-20 text-foreground md:pb-8">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:flex-nowrap sm:px-6">
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('forecast')}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 shadow-sm transition hover:scale-105"
                title="Nibbles NZ"
              >
                <Fish className="h-5 w-5" />
              </button>
              <span className="font-display text-lg font-extrabold tracking-tight whitespace-nowrap">
                Nibbles
              </span>
            </div>

            <div className="order-3 flex w-full justify-center sm:order-2 sm:w-auto sm:flex-1">
              <SpotCombobox
                selectedSpot={selectedSpot}
                onSelectSpot={setSelectedSpot}
                onLocateNearest={locateNearestSpot}
                locating={locating}
              />
            </div>

            <div className="order-2 flex shrink-0 items-center gap-1.5 sm:order-3 sm:gap-2">
              <BlinkingClock />
              <Button
                variant="outline"
                size="icon"
                onClick={() => loadSpot(selectedSpot)}
                className="h-8 w-8"
                title="Refresh Live Open-Meteo Data"
                aria-label="Refresh forecast"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode((d) => !d)}
                className="h-8 w-8"
                aria-label="Toggle dark/light theme"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] space-y-4 px-3 py-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList className="hidden bg-muted/60 p-1 md:inline-flex">
                <TabsTrigger value="forecast" className="gap-1.5 whitespace-nowrap">
                  <LayoutDashboard className="h-4 w-4" /> Forecast &amp; Matrix
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-1.5 whitespace-nowrap">
                  <Compass className="h-4 w-4" /> NZ Map (125 Spots)
                </TabsTrigger>
              </TabsList>

              {bundle && (
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedSpot.name}</span>
                  <span>·</span>
                  <span>{bundle.currentTempC}°C</span>
                  <span>·</span>
                  <span>
                    {bundle.currentWindDir} {bundle.currentWindKmh} km/h
                  </span>
                  {bundle.currentSwellM != null && (
                    <>
                      <span>·</span>
                      <span>Swell {bundle.currentSwellM}m</span>
                    </>
                  )}
                  {bundle.currentSstC != null && (
                    <>
                      <span>·</span>
                      <span>SST {bundle.currentSstC}°C</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center justify-between rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Live feed unavailable ({error})
                </span>
                <Button size="xs" variant="destructive" onClick={() => loadSpot(selectedSpot)}>
                  Retry Live Fetch
                </Button>
              </div>
            )}

            <TabsContent value="forecast" className="space-y-4">
              {loading && !bundle ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Skeleton className="h-52 rounded-xl" />
                    <Skeleton className="h-52 rounded-xl" />
                    <Skeleton className="h-52 rounded-xl" />
                  </div>
                  <Skeleton className="h-96 rounded-xl" />
                </div>
              ) : bundle ? (
                <>
                  {/* Top 3 Visual Cards */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <SolunarClockCard
                        solunar={bundle.todaySolunar}
                        currentScore={bundle.currentScore}
                        currentLabel={bundle.currentLabel}
                        fishCount={bundle.currentFishCount}
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <TideSolunarChart hourly24={bundle.hourly24} solunar={bundle.todaySolunar} />
                    </div>
                    <div className="lg:col-span-4">
                      <SevenDayCalendarCard
                        days={bundle.days}
                        activeDayIndex={activeDayIndex}
                        onSelectDay={setActiveDayIndex}
                      />
                    </div>
                  </div>

                  {/* Full-Width SurfCheck-Style 7-Day Fishing Matrix Table */}
                  <FishingMatrixTable
                    spot={bundle.spot}
                    days={bundle.days}
                    slots={bundle.matrixSlots}
                    activeDayIndex={activeDayIndex}
                    fetchedAt={bundle.fetchedAt}
                  />

                  {/* Additional Live Wind, Pressure & Swell Graphs */}
                  <TrendGraphsSection hourly24={bundle.hourly24} />
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="map">
              <NibblesMap
                selectedSpot={selectedSpot}
                onSelectSpot={(spot) => {
                  setSelectedSpot(spot);
                }}
                userCoords={userCoords}
                onRequestGps={locateNearestSpot}
              />
            </TabsContent>
          </Tabs>
        </main>

        {/* Mobile Docked Bottom Navigation */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t bg-background/95 backdrop-blur-md md:hidden"
        >
          <button
            type="button"
            onClick={() => setActiveTab('forecast')}
            className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium ${
              activeTab === 'forecast' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Forecast</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium ${
              activeTab === 'map' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Compass className="h-5 w-5" />
            <span>125 NZ Spots</span>
          </button>
          <button
            type="button"
            onClick={() => loadSpot(selectedSpot)}
            className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh</span>
          </button>
        </nav>
      </div>
    </TooltipProvider>
  );
}

export default App;
