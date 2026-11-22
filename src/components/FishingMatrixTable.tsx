import { useEffect, useRef } from 'react';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  ExternalLink,
  Fish,
  Gauge,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Waves,
  Wind,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type NzFishingSpot } from '@/data/nzSpots125';
import { type DaySummary, type MatrixSlot, type SkyCondition } from '@/lib/liveForecast';

interface FishingMatrixTableProps {
  spot: NzFishingSpot;
  days: DaySummary[];
  slots: MatrixSlot[];
  activeDayIndex: number;
  fetchedAt: string;
}

function SkyIcon({ sky }: { sky: SkyCondition }) {
  switch (sky) {
    case 'clear':
      return <Sun className="h-5 w-5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />;
    case 'partly-cloudy':
      return <CloudSun className="h-5 w-5 text-amber-300" />;
    case 'cloudy':
      return <Cloud className="h-5 w-5 text-slate-400" />;
    case 'rain':
      return <CloudRain className="h-5 w-5 text-sky-400" />;
    case 'storm':
      return <CloudLightning className="h-5 w-5 text-yellow-400" />;
  }
}

function uvBadgeClass(uv: number): string {
  if (uv <= 2) return 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400';
  if (uv <= 5) return 'border-amber-500/50 bg-amber-500/15 text-amber-400';
  if (uv <= 7) return 'border-orange-500/50 bg-orange-500/15 text-orange-400';
  return 'border-rose-500/50 bg-rose-500/15 text-rose-400';
}

function biteStyle(label: MatrixSlot['biteLabel']) {
  switch (label) {
    case 'PRIME':
      return {
        pill: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        bar: 'bg-emerald-400',
      };
    case 'GOOD':
      return {
        pill: 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.18)]',
        bar: 'bg-cyan-400',
      };
    case 'FAIR':
      return {
        pill: 'border-amber-500/50 bg-amber-500/20 text-amber-300',
        bar: 'bg-amber-400',
      };
    case 'POOR':
      return {
        pill: 'border-rose-500/50 bg-rose-500/20 text-rose-300',
        bar: 'bg-rose-400',
      };
  }
}

function windBarColor(kmh: number): string {
  if (kmh <= 12) return 'bg-emerald-400';
  if (kmh <= 22) return 'bg-cyan-400';
  if (kmh <= 32) return 'bg-amber-400';
  return 'bg-rose-500';
}

export function FishingMatrixTable({
  spot,
  days,
  slots,
  activeDayIndex,
  fetchedAt,
}: FishingMatrixTableProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const targetLeft = Math.max(0, activeDayIndex * 424);
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [activeDayIndex]);

  return (
    <Card className="overflow-hidden border-border/80 bg-card/90">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display flex flex-wrap items-center gap-2 text-lg font-extrabold">
              <Fish className="h-5 w-5 text-primary" />
              <span>{spot.name}</span>
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                {spot.region}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Target: {spot.targetSpecies.join(' · ')} · {spot.accessNote}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>Live Open-Meteo · {fetchedAt}</span>
            <a
              href="https://www.linz.govt.nz/sea/tides/tide-predictions"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              LINZ <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div ref={scrollRef} className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              {/* Row 1: Day Headers */}
              <tr className="border-y bg-muted/40">
                <th className="sticky left-0 z-20 w-28 min-w-[106px] border-r bg-card px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  7-Day Matrix
                </th>
                {days.map((d) => (
                  <th
                    key={d.dayIndex}
                    colSpan={4}
                    className={`border-r px-3 py-2 text-left font-display text-xs font-bold transition-colors ${
                      d.dayIndex === activeDayIndex ? 'bg-primary/15 text-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="whitespace-nowrap">{d.dateLabel}</span>
                      <span className="font-mono text-[10px] font-normal text-muted-foreground">
                        {d.solunar.emoji} {d.highC}°/{d.lowC}°
                      </span>
                    </div>
                  </th>
                ))}
              </tr>

              {/* Row 2: Time Slots */}
              <tr className="border-b bg-muted/20">
                <th className="sticky left-0 z-20 border-r bg-card px-3 py-1.5 text-left font-mono text-[10px] text-muted-foreground">
                  TIME
                </th>
                {slots.map((slot) => (
                  <th
                    key={slot.key}
                    className={`min-w-[106px] px-2 py-1.5 text-center font-mono text-[11px] font-semibold ${
                      slot.hourOfDay === 18 ? 'border-r' : ''
                    } ${slot.isNow ? 'bg-cyan-500/20 text-cyan-300' : 'text-muted-foreground'}`}
                  >
                    {slot.isNow ? '● NOW' : slot.slotLabel}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {/* BITE RATING (Graphical Score Pill + Mini Fish Icons + Gauge Bar) */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Fish className="h-3.5 w-3.5 text-cyan-400" /> BITE
                  </span>
                </td>
                {slots.map((s) => {
                  const st = biteStyle(s.biteLabel);
                  return (
                    <td
                      key={s.key}
                      className={`px-2 py-2 text-center ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                        s.isNow ? 'bg-cyan-500/12' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap ${st.pill}`}
                        >
                          <span>{s.biteScore.toFixed(1)}</span>
                          <span className="text-[9px]">{s.biteLabel}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Fish
                              key={i}
                              className={`h-2.5 w-2.5 ${
                                i <= s.fishCount
                                  ? 'fill-cyan-400 text-cyan-400'
                                  : 'text-muted-foreground/20'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${st.bar}`}
                            style={{ width: `${Math.min(100, Math.round(s.biteScore * 10))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* SOLUNAR */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-amber-400" /> SOLUNAR
                  </span>
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    title={s.solunarTooltip}
                    className={`px-2 py-2 text-center ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                      s.isNow ? 'bg-cyan-500/12' : ''
                    }`}
                  >
                    {s.solunarTag === 'MAJOR' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                        <Sparkles className="h-2.5 w-2.5" /> MAJOR
                      </span>
                    ) : s.solunarTag === 'MINOR' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                        <Moon className="h-2.5 w-2.5" /> MINOR
                      </span>
                    ) : s.solunarTag === 'TWILIGHT' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
                        <Sunrise className="h-2.5 w-2.5" /> TWILIGHT
                      </span>
                    ) : (
                      <span className="text-muted-foreground/35">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* TIDE (Graphical Water-Level Meter + Flow Arrow) */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Waves className="h-3.5 w-3.5 text-sky-400" /> TIDE
                  </span>
                </td>
                {slots.map((s) => {
                  const pct = Math.min(100, Math.max(12, Math.round((s.tideHeightM / 2.8) * 100)));
                  return (
                    <td
                      key={s.key}
                      className={`px-2 py-2 font-mono text-[11px] ${
                        s.hourOfDay === 18 ? 'border-r' : ''
                      } ${s.isNow ? 'bg-cyan-500/12' : ''}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {/* Vertical Water Column Meter */}
                        <div className="relative h-7 w-2 overflow-hidden rounded-full border border-cyan-500/30 bg-slate-900/80">
                          <div
                            className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-sky-500 to-cyan-300 transition-all duration-500"
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <div className="text-left leading-tight">
                          <div
                            className={`flex items-center gap-0.5 font-bold whitespace-nowrap ${
                              s.tideText.startsWith('H') ? 'text-cyan-400' : 'text-foreground/90'
                            }`}
                          >
                            {s.tideRising ? (
                              <ArrowUp className="h-2.5 w-2.5 text-emerald-400" />
                            ) : (
                              <ArrowDown className="h-2.5 w-2.5 text-amber-400" />
                            )}
                            <span>{s.tideText.split(' ').slice(0, 2).join(' ')}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {s.tideHeightM.toFixed(1)}m
                          </div>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* SWELL (3-Bar Ocean Wave Visual + Compass Ring) */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Waves className="h-3.5 w-3.5 text-cyan-300" /> SWELL
                  </span>
                </td>
                {slots.map((s) => {
                  const h1 = s.swellM != null ? Math.min(26, Math.max(6, Math.round(s.swellM * 10))) : 4;
                  const h2 = Math.max(4, Math.round(h1 * 0.72));
                  const h3 = Math.max(3, Math.round(h1 * 0.48));
                  return (
                    <td
                      key={s.key}
                      className={`px-2 py-2 text-center font-mono ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                        s.isNow ? 'bg-cyan-500/12' : ''
                      }`}
                    >
                      {s.swellM != null ? (
                        <div className="flex items-end justify-center gap-2">
                          <div className="flex h-7 items-end gap-0.5">
                            <span className="w-1.5 rounded-t bg-sky-500" style={{ height: `${h1}px` }} />
                            <span className="w-1.5 rounded-t bg-cyan-400/80" style={{ height: `${h2}px` }} />
                            <span className="w-1 rounded-t bg-cyan-300/50" style={{ height: `${h3}px` }} />
                          </div>
                          <div className="text-left leading-tight">
                            <div className="text-[11px] font-bold">{s.swellM}m</div>
                            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <span>{s.swellPeriodS ?? '--'}s</span>
                              {s.swellDeg != null && (
                                <ArrowUp
                                  className="h-2.5 w-2.5 text-cyan-400"
                                  style={{ transform: `rotate(${(s.swellDeg + 180) % 360}deg)` }}
                                />
                              )}
                              <span>{s.swellCompass}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* WIND (Beaufort Speed Bar + Compass Circle Arrow) */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-primary" /> WIND
                  </span>
                </td>
                {slots.map((s) => {
                  const pct = Math.min(100, Math.max(12, Math.round((s.windKmh / 42) * 100)));
                  return (
                    <td
                      key={s.key}
                      title={`Gusts ${s.gustKmh} km/h`}
                      className={`px-2 py-2 text-center font-mono ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                        s.isNow ? 'bg-cyan-500/12' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                            <ArrowUp
                              className="h-3 w-3 text-primary"
                              style={{ transform: `rotate(${(s.windDeg + 180) % 360}deg)` }}
                            />
                          </span>
                          <div className="text-left leading-tight">
                            <div className="text-[11px] font-bold whitespace-nowrap">{s.windKmh} km/h</div>
                            <div className="text-[9px] text-muted-foreground">
                              {s.windCompass} · G{s.gustKmh}
                            </div>
                          </div>
                        </div>
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${windBarColor(s.windKmh)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* PRESSURE */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-emerald-400" /> BARO
                  </span>
                </td>
                {slots.map((s) => {
                  const Icon =
                    s.pressureTrend === 'rising'
                      ? ArrowUpRight
                      : s.pressureTrend === 'falling'
                        ? ArrowDownRight
                        : ArrowRight;
                  const pill =
                    s.pressureTrend === 'falling'
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400'
                      : s.pressureTrend === 'rising'
                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                        : 'border-border bg-muted/40 text-muted-foreground';
                  return (
                    <td
                      key={s.key}
                      className={`px-2 py-2 text-center font-mono text-[11px] whitespace-nowrap ${
                        s.hourOfDay === 18 ? 'border-r' : ''
                      } ${s.isNow ? 'bg-cyan-500/12' : ''}`}
                    >
                      <span className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 ${pill}`}>
                        {s.pressureHpa}
                        <Icon className="h-3 w-3" />
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* SKY, TEMP & RAIN */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" /> SKY
                  </span>
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    className={`px-2 py-2 text-center font-mono ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                      s.isNow ? 'bg-cyan-500/12' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <SkyIcon sky={s.sky} />
                        <span className="text-[11px] font-bold">{s.tempC}°C</span>
                      </div>
                      {s.rainPct >= 15 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-sky-400">
                          <Droplets className="h-2.5 w-2.5" /> {s.rainPct}%
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* UV INDEX */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  UV INDEX
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    className={`px-2 py-2 text-center ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                      s.isNow ? 'bg-cyan-500/12' : ''
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px] font-bold ${uvBadgeClass(
                        s.uvIndex
                      )}`}
                    >
                      {s.uvIndex}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
