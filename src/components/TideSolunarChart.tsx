import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sunrise, Sunset } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type HourlyChartPoint } from '@/lib/liveForecast';
import { type DaySolunarInfo } from '@/lib/solunar';

interface TideSolunarChartProps {
  hourly24: HourlyChartPoint[];
  solunar: DaySolunarInfo;
}

export function TideSolunarChart({ hourly24, solunar }: TideSolunarChartProps) {
  const nowHr = Number(
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      hour: '2-digit',
      hour12: false,
    }).format(new Date())
  );

  return (
    <Card className="h-full border-border/80 bg-card/90">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-display text-base font-bold">
            Tide &amp; Solunar Overlay Graph
          </CardTitle>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-sm bg-emerald-500/70" /> Major
            </span>
            <span className="inline-flex items-center gap-1 text-amber-400">
              <span className="h-2 w-2 rounded-sm bg-amber-500/70" /> Minor
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={hourly24} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tideOverlayFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.14} />
              <XAxis
                dataKey="hourNum"
                type="number"
                domain={[0, 23]}
                ticks={[0, 6, 12, 18, 23]}
                tickFormatter={(h) => `${h}h`}
                tick={{ fontSize: 10 }}
              />
              <YAxis domain={[0, 2.8]} tick={{ fontSize: 10 }} unit="m" />
              <Tooltip
                labelFormatter={(h) => `${String(h).padStart(2, '0')}:00 NZT`}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />

              {/* Shaded Solunar Major & Minor Bands */}
              {solunar.windows.map((w, idx) => (
                <ReferenceArea
                  key={`${w.label}-${idx}`}
                  x1={Math.max(0, Math.floor(w.startHour))}
                  x2={Math.min(23, Math.ceil(w.endHour))}
                  fill={w.kind === 'MAJOR' ? '#10b981' : '#f59e0b'}
                  fillOpacity={w.kind === 'MAJOR' ? 0.22 : 0.16}
                />
              ))}

              <ReferenceLine x={nowHr} stroke="#f8fafc" strokeDasharray="3 3" strokeWidth={1.5} />

              <Area
                type="monotone"
                dataKey="tideM"
                stroke="#22d3ee"
                strokeWidth={2.5}
                fill="url(#tideOverlayFill)"
                name="Tide (m)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between border-t pt-2 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Sunrise className="h-3.5 w-3.5 text-amber-400" /> Dawn {solunar.sunrise}
          </span>
          <span>
            {solunar.moonrise ? `☽ Rise ${solunar.moonrise}` : ''}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sunset className="h-3.5 w-3.5 text-orange-400" /> Dusk {solunar.sunset}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
