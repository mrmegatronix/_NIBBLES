import { useEffect, useRef } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  ExternalLink,
  Sun,
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
      return <Sun className="h-4 w-4 text-amber-400" />;
    case 'partly-cloudy':
      return <CloudSun className="h-4 w-4 text-amber-300" />;
    case 'cloudy':
      return <Cloud className="h-4 w-4 text-slate-400" />;
    case 'rain':
      return <CloudRain className="h-4 w-4 text-sky-400" />;
    case 'storm':
      return <CloudLightning className="h-4 w-4 text-yellow-400" />;
  }
}

function uvBadgeClass(uv: number): string {
  if (uv <= 2) return 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400';
  if (uv <= 5) return 'border-amber-500/50 bg-amber-500/15 text-amber-400';
  if (uv <= 7) return 'border-orange-500/50 bg-orange-500/15 text-orange-400';
  return 'border-rose-500/50 bg-rose-500/15 text-rose-400';
}

function bitePillClass(label: MatrixSlot['biteLabel']): string {
  switch (label) {
    case 'PRIME':
      return 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300';
    case 'GOOD':
      return 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300';
    case 'FAIR':
      return 'border-amber-500/50 bg-amber-500/20 text-amber-300';
    case 'POOR':
      return 'border-rose-500/50 bg-rose-500/20 text-rose-300';
  }
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
    // Each day has 4 columns (~96px each = 384px)
    const targetLeft = Math.max(0, activeDayIndex * 368);
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [activeDayIndex]);

  return (
    <Card className="overflow-hidden border-border/80 bg-card/90">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display flex flex-wrap items-center gap-2 text-lg font-extrabold">
              <span>{spot.name}</span>
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                {spot.region}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Target: {spot.targetSpecies.join(' · ')} · {spot.accessNote}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
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
                <th className="sticky left-0 z-20 w-24 min-w-[92px] border-r bg-card px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  7-Day Matrix
                </th>
                {days.map((d) => (
                  <th
                    key={d.dayIndex}
                    colSpan={4}
                    className={`border-r px-2.5 py-2 text-left font-display text-xs font-bold ${
                      d.dayIndex === activeDayIndex ? 'bg-primary/10 text-primary' : ''
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
                    className={`min-w-[92px] px-2 py-1.5 text-center font-mono text-[11px] font-semibold ${
                      slot.hourOfDay === 18 ? 'border-r' : ''
                    } ${slot.isNow ? 'bg-cyan-500/20 text-cyan-300' : 'text-muted-foreground'}`}
                  >
                    {slot.slotLabel}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {/* BITE RATING */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  BITE RATING
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    className={`px-1.5 py-2 text-center ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                      s.isNow ? 'bg-cyan-500/12' : ''
                    }`}
                  >
                    <div
                      className={`mx-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap ${bitePillClass(
                        s.biteLabel
                      )}`}
                    >
                      <span>{s.biteScore.toFixed(1)}</span>
                      <span className="text-[9px]">{s.biteLabel}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* SOLUNAR */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  SOLUNAR
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    title={s.solunarTooltip}
                    className={`px-1.5 py-2 text-center ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                      s.isNow ? 'bg-cyan-500/12' : ''
                    }`}
                  >
                    {s.solunarTag === 'MAJOR' ? (
                      <span className="inline-block rounded-full border border-emerald-500/50 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                        MAJOR
                      </span>
                    ) : s.solunarTag === 'MINOR' ? (
                      <span className="inline-block rounded-full border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                        MINOR
                      </span>
                    ) : s.solunarTag === 'TWILIGHT' ? (
                      <span className="inline-block rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
                        DAWN/DUSK
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* TIDE */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  TIDE
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    className={`px-1.5 py-2 text-center font-mono text-[11px] whitespace-nowrap ${
                      s.hourOfDay === 18 ? 'border-r' : ''
                    } ${s.isNow ? 'bg-cyan-500/12' : ''}`}
                  >
                    <span className={s.tideText.startsWith('H') ? 'font-bold text-cyan-400' : 'text-foreground/85'}>
                      {s.tideText}
                    </span>
                  </td>
                ))}
              </tr>

              {/* SWELL */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  SWELL
                </td>
                {slots.map((s) => {
                  const barHeight = s.swellM != null ? Math.min(24, Math.max(5, Math.round(s.swellM * 9))) : 4;
                  return (
                    <td
                      key={s.key}
                      className={`px-1.5 py-2 text-center font-mono ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                        s.isNow ? 'bg-cyan-500/12' : ''
                      }`}
                    >
                      {s.swellM != null ? (
                        <div className="flex items-end justify-center gap-1.5">
                          <div className="flex h-6 items-end gap-0.5">
                            <span
                              className="w-1.5 rounded-t bg-sky-500"
                              style={{ height: `${barHeight}px` }}
                            />
                            <span
                              className="w-1 rounded-t bg-cyan-400/70"
                              style={{ height: `${Math.max(4, barHeight - 4)}px` }}
                            />
                          </div>
                          <div className="text-left leading-tight">
                            <div className="font-bold text-[11px]">{s.swellM}m</div>
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

              {/* WIND */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  WIND
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    title={`Gusts ${s.gustKmh} km/h`}
                    className={`px-1.5 py-2 text-center font-mono ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                      s.isNow ? 'bg-cyan-500/12' : ''
                    }`}
                  >
                    <div className="font-bold text-[11px] whitespace-nowrap">{s.windKmh} km/h</div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <ArrowUp
                        className="h-3 w-3 text-primary"
                        style={{ transform: `rotate(${(s.windDeg + 180) % 360}deg)` }}
                      />
                      <span>{s.windCompass}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* PRESSURE */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  PRESSURE
                </td>
                {slots.map((s) => {
                  const Icon =
                    s.pressureTrend === 'rising'
                      ? ArrowUpRight
                      : s.pressureTrend === 'falling'
                        ? ArrowDownRight
                        : ArrowRight;
                  const cls =
                    s.pressureTrend === 'falling'
                      ? 'text-emerald-400'
                      : s.pressureTrend === 'rising'
                        ? 'text-cyan-400'
                        : 'text-muted-foreground';
                  return (
                    <td
                      key={s.key}
                      className={`px-1.5 py-2 text-center font-mono text-[11px] whitespace-nowrap ${
                        s.hourOfDay === 18 ? 'border-r' : ''
                      } ${s.isNow ? 'bg-cyan-500/12' : ''}`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {s.pressureHpa}
                        <Icon className={`h-3.5 w-3.5 ${cls}`} />
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* SKY & TEMP */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  SKY &amp; TEMP
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    className={`px-1.5 py-2 text-center font-mono ${s.hourOfDay === 18 ? 'border-r' : ''} ${
                      s.isNow ? 'bg-cyan-500/12' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <SkyIcon sky={s.sky} />
                      <span className="font-bold text-[11px]">{s.tempC}°C</span>
                    </div>
                    {s.rainPct >= 20 && (
                      <div className="text-[10px] text-sky-400">{s.rainPct}% rain</div>
                    )}
                  </td>
                ))}
              </tr>

              {/* UV */}
              <tr>
                <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-muted-foreground whitespace-nowrap">
                  UV INDEX
                </td>
                {slots.map((s) => (
                  <td
                    key={s.key}
                    className={`px-1.5 py-2 text-center ${s.hourOfDay === 18 ? 'border-r' : ''} ${
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
