import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  Compass,
  Droplets,
  ExternalLink,
  Eye,
  Fish,
  LayoutDashboard,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Waves,
  Wind,
} from 'lucide-react';
import { BlinkingClock } from '@/components/BlinkingClock';
import { NibblesMap } from '@/components/NibblesMap';
import { SurfCheckEmbed } from '@/components/SurfCheckEmbed';
import { NIBBLES_SPOTS, type NibblesSpot } from '@/data/spots';
import {
  fetchLiveSpotWeather,
  getFutureTideEvents,
  getHourlyTideCurve,
  getMoonInfo,
  getTideHeightAt,
  type LiveWeatherData,
} from '@/lib/liveMarine';

export function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [tab, setTab] = useState<'overview' | 'map' | 'tides'>('overview');
  const [selectedSpot, setSelectedSpot] = useState<NibblesSpot>(NIBBLES_SPOTS[0]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const loadWeather = useCallback(async (spot: NibblesSpot) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const live = await fetchLiveSpotWeather(spot.lat, spot.lng);
      setWeather(live);
    } catch (err) {
      setWeather(null);
      setWeatherError(err instanceof Error ? err.message : 'Unable to reach Open-Meteo live feed');
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedSpot);
  }, [selectedSpot, loadWeather]);

  const requestGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserCoords({
        lat: Number(pos.coords.latitude.toFixed(5)),
        lng: Number(pos.coords.longitude.toFixed(5)),
      });
    });
  };

  const now = useMemo(() => new Date(), []);
  const currentTide = useMemo(() => getTideHeightAt(now), [now]);
  const nextHourTide = useMemo(() => getTideHeightAt(new Date(now.getTime() + 3600000)), [now]);
  const isRising = nextHourTide >= currentTide;
  const tideCurve = useMemo(() => getHourlyTideCurve(now), [now]);
  const futureTides = useMemo(() => getFutureTideEvents(4, now), [now]);
  const moon = useMemo(() => getMoonInfo(now), [now]);

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 shadow-sm">
              <Fish className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold tracking-tight whitespace-nowrap">
                  Nibbles
                </span>
                <span className="hidden rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold sm:inline-block whitespace-nowrap">
                  CANTERBURY · LIVE
                </span>
              </div>
              <div className="hidden font-mono text-[11px] text-muted-foreground md:block whitespace-nowrap tabular-nums">
                {selectedSpot.name} · Tide {currentTide.toFixed(2)}m {isRising ? '↑' : '↓'}
                {weather ? ` · ${weather.tempC}°C · ${weather.windDir} ${weather.windKmh} km/h` : ''}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <BlinkingClock />
            <button
              type="button"
              onClick={() => loadWeather(selectedSpot)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-muted"
              title="Refresh Live Weather"
              aria-label="Refresh weather"
            >
              <RefreshCw className={`h-4 w-4 ${loadingWeather ? 'animate-spin text-primary' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-muted"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] space-y-4 px-3 py-4 sm:px-6">
        {/* Desktop Navigation */}
        <div className="hidden gap-1.5 rounded-xl border bg-card p-1.5 md:inline-flex">
          {[
            { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
            { id: 'map', label: 'Google Map & Spots', Icon: Compass },
            { id: 'tides', label: 'Tides & Weather', Icon: Waves },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id as typeof tab)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Spot Selector Strip */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {NIBBLES_SPOTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSpot(s)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                s.id === selectedSpot.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              {s.name}
            </button>
          ))}
        </div>

        {/* Weather Error Banner (if live API fails — never mock data) */}
        {weatherError && (
          <div className="flex items-center justify-between rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Live weather unavailable ({weatherError})
            </span>
            <button
              type="button"
              onClick={() => loadWeather(selectedSpot)}
              className="rounded-md border border-destructive px-2.5 py-1 text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Current Tide (Lyttelton)</span>
                  {isRising ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
                  {currentTide.toFixed(2)} m
                </div>
                <div className="mt-1 text-xs text-primary">
                  {isRising ? 'Incoming (Rising)' : 'Outgoing (Falling)'} · Next {futureTides[0]?.type}{' '}
                  {futureTides[0]?.time}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Live Wind &amp; Gusts</span>
                  <Wind className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
                  {weather ? `${weather.windKmh} km/h ${weather.windDir}` : loadingWeather ? 'Loading...' : '--'}
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {weather ? `Gusts ${weather.gustKmh} km/h · ${weather.pressureHpa} hPa` : 'Open-Meteo Live'}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Live Temp &amp; Swell</span>
                  <Thermometer className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
                  {weather ? `${weather.tempC}°C` : loadingWeather ? 'Loading...' : '--'}
                  {weather?.swellM != null && (
                    <span className="ml-2 text-base font-normal text-cyan-400">
                      · {weather.swellM}m @ {weather.swellPeriodS}s
                    </span>
                  )}
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {weather?.sstC != null ? `SST ${weather.sstC}°C · ` : ''}
                  {weather ? `Feels ${weather.feelsLikeC}°C` : ''}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Moon Cycle</span>
                  <Moon className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="mt-1 text-xl font-bold">
                  {moon.emoji} {moon.phaseName}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {moon.illumination}% lit · Age {moon.ageDays}d
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="rounded-2xl border bg-card p-4 lg:col-span-7">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold">24-Hour Tide Curve</h2>
                    <p className="text-xs text-muted-foreground">{selectedSpot.name} · {selectedSpot.bestTide}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('tides')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Full Tides &amp; Weather →
                  </button>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tideCurve} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="nibblesTide" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} interval={3} />
                      <YAxis domain={[0, 2.8]} tick={{ fontSize: 11 }} unit="m" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="height" stroke="#22d3ee" strokeWidth={2.5} fill="url(#nibblesTide)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-4 lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold">{selectedSpot.name}</h2>
                  <button
                    type="button"
                    onClick={() => setTab('map')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Open Google Map →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <div className="text-muted-foreground">Depth</div>
                    <div className="font-semibold">{selectedSpot.depthRange}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <div className="text-muted-foreground">Boat Ramp</div>
                    <div className="truncate font-semibold">{selectedSpot.boatRamp}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSpot.targetSpecies.map((sp) => (
                    <span key={sp} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                      {sp}
                    </span>
                  ))}
                </div>
                {selectedSpot.localRuleNote && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                    {selectedSpot.localRuleNote}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE MAP & SPOTS */}
        {tab === 'map' && (
          <div className="rounded-2xl border bg-card p-4">
            <NibblesMap
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
              userCoords={userCoords}
              onRequestGps={requestGps}
            />
          </div>
        )}

        {/* TAB 3: TIDES & LIVE WEATHER */}
        {tab === 'tides' && (
          <div className="space-y-4">
            {weather && (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-xl border bg-card p-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Droplets className="h-3.5 w-3.5 text-cyan-400" /> Humidity
                    </div>
                    <div className="mt-1 font-mono text-base font-bold">{weather.humidityPct}%</div>
                  </div>
                  <div className="rounded-xl border bg-card p-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3.5 w-3.5 text-emerald-400" /> Visibility
                    </div>
                    <div className="mt-1 font-mono text-base font-bold">{weather.visibilityKm} km</div>
                  </div>
                  <div className="rounded-xl border bg-card p-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Sun className="h-3.5 w-3.5 text-yellow-400" /> UV Index
                    </div>
                    <div className="mt-1 font-mono text-base font-bold">{weather.uvIndex}</div>
                  </div>
                  <div className="rounded-xl border bg-card p-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Sunrise className="h-3.5 w-3.5 text-orange-400" /> Sunrise
                    </div>
                    <div className="mt-1 font-mono text-base font-bold">{weather.sunrise}</div>
                  </div>
                  <div className="rounded-xl border bg-card p-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Sunset className="h-3.5 w-3.5 text-rose-400" /> Sunset
                    </div>
                    <div className="mt-1 font-mono text-base font-bold">{weather.sunset}</div>
                  </div>
                  <div className="rounded-xl border bg-card p-3 text-xs">
                    <div className="text-muted-foreground">Synced At</div>
                    <div className="mt-1 font-mono text-base font-bold text-emerald-400">
                      {weather.fetchedAt}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="rounded-2xl border bg-card p-4 lg:col-span-6">
                    <h2 className="font-display mb-2 text-base font-bold">12-Hour Live Wind, Gusts &amp; Temp</h2>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={weather.hourly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--border)',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="gustKmh" fill="#f97316" opacity={0.35} name="Gusts (km/h)" radius={[4, 4, 0, 0]} />
                          <Line type="monotone" dataKey="windKmh" stroke="#22d3ee" strokeWidth={2} name="Wind (km/h)" />
                          <Line type="monotone" dataKey="tempC" stroke="#fbbf24" strokeWidth={2} name="Temp (°C)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-card p-4 lg:col-span-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="font-display text-base font-bold">5-Day Open-Meteo Forecast</h2>
                      <a
                        href="https://www.linz.govt.nz/sea/tides/tide-predictions"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        LINZ Tides <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {weather.forecast.map((f) => (
                        <div key={f.day} className="rounded-xl border bg-muted/30 p-3 text-center">
                          <div className="text-xs font-semibold text-primary">{f.day}</div>
                          <div className="mt-1 font-mono text-base font-bold">
                            {f.highC}°/{f.lowC}°
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{f.windKmh} km/h</div>
                          <div className="text-[11px] text-cyan-400">{f.rainPct}% rain</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-2xl border bg-card p-4">
              <h2 className="font-display mb-2 text-base font-bold">Upcoming High &amp; Low Tides (4 Days)</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {futureTides.slice(0, 12).map((ev, idx) => (
                  <div
                    key={`${ev.dayLabel}-${ev.time}-${idx}`}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          ev.type === 'HIGH' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        }`}
                      >
                        {ev.type}
                      </span>
                      <span className="font-mono font-semibold">{ev.time}</span>
                      <span className="text-xs text-muted-foreground">{ev.dayLabel}</span>
                    </div>
                    <span className="font-mono text-xs font-bold">{ev.height.toFixed(2)}m</span>
                  </div>
                ))}
              </div>
            </div>

            <SurfCheckEmbed theme={darkMode ? 'dark' : 'light'} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t bg-background/95 backdrop-blur-md md:hidden">
        {[
          { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
          { id: 'map', label: 'Map', Icon: Compass },
          { id: 'tides', label: 'Tides & Weather', Icon: Waves },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as typeof tab)}
            className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium ${
              tab === id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
