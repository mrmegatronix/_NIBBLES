import { Fish } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BiteLabel } from '@/lib/liveForecast';
import { type DaySolunarInfo } from '@/lib/solunar';

interface SolunarClockCardProps {
  solunar: DaySolunarInfo;
  currentScore: number;
  currentLabel: BiteLabel;
  fishCount: number;
}

function polarToCartesian(cx: number, cy: number, r: number, hour24: number) {
  const angleDeg = (hour24 / 24) * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startHr: number, endHr: number) {
  const start = polarToCartesian(cx, cy, r, startHr);
  const end = polarToCartesian(cx, cy, r, endHr);
  const span = Math.max(0.2, endHr - startHr);
  const largeArc = span > 12 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function SolunarClockCard({
  solunar,
  currentScore,
  currentLabel,
  fishCount,
}: SolunarClockCardProps) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const nowHr =
    Number(parts.find((p) => p.type === 'hour')?.value ?? 12) +
    Number(parts.find((p) => p.type === 'minute')?.value ?? 0) / 60;

  const hand = polarToCartesian(90, 90, 56, nowHr);

  const badgeTone =
    currentLabel === 'PRIME'
      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
      : currentLabel === 'GOOD'
        ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-400'
        : currentLabel === 'FAIR'
          ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
          : 'border-rose-500/50 bg-rose-500/15 text-rose-400';

  return (
    <Card className="h-full border-border/80 bg-card/90">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-display text-base font-bold">
            Solunar Bite Clock &amp; Maramataka
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px]">
            {solunar.maramatakaName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        {/* 24-Hour Radial Solunar Clock */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 180 180" className="h-40 w-40">
            <circle cx="90" cy="90" r="70" fill="none" stroke="currentColor" className="text-muted/60" strokeWidth="10" />
            <circle cx="90" cy="90" r="56" fill="none" stroke="currentColor" className="text-border" strokeWidth="1" strokeDasharray="3 3" />

            {/* Solunar Major (Emerald) & Minor (Amber) Arcs */}
            {solunar.windows.map((w, idx) => (
              <path
                key={`${w.label}-${idx}`}
                d={describeArc(90, 90, 70, w.startHour, w.endHour)}
                fill="none"
                stroke={w.kind === 'MAJOR' ? '#10b981' : '#f59e0b'}
                strokeWidth="10"
                strokeLinecap="round"
              />
            ))}

            {/* 24h Cardinal Ticks */}
            <text x="90" y="13" textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-mono">
              24
            </text>
            <text x="171" y="94" textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-mono">
              6
            </text>
            <text x="90" y="175" textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-mono">
              12
            </text>
            <text x="11" y="94" textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-mono">
              18
            </text>

            {/* Current Time Hand */}
            <line
              x1="90"
              y1="90"
              x2={hand.x}
              y2={hand.y}
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="90" cy="90" r="4" fill="#22d3ee" />
          </svg>
        </div>

        {/* Moon Phase, Fish Rating & Major Windows */}
        <div className="flex w-full min-w-0 flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl leading-none">{solunar.emoji}</span>
            <div className="min-w-0">
              <div className="font-mono text-base font-bold leading-tight">
                {solunar.illuminationPct}%
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {solunar.phaseName} · Day {solunar.lunarDay}
              </div>
            </div>
          </div>

          {/* 1-5 Fish Rating Icons */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Fish
                  key={i}
                  className={`h-4 w-4 ${
                    i <= fishCount ? 'fill-cyan-400 text-cyan-400' : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs text-muted-foreground">{fishCount}/5</span>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold ${badgeTone}`}
          >
            <span>{currentScore.toFixed(1)}</span>
            <span>{currentLabel} BITE</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            {solunar.windows
              .filter((w) => w.kind === 'MAJOR')
              .slice(0, 2)
              .map((w) => (
                <div
                  key={w.label}
                  className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-emerald-400 truncate"
                >
                  ★ {w.peakTime}
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
