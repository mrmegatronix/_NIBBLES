import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Gauge, Wind } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type HourlyChartPoint } from '@/lib/liveForecast';

export function TrendGraphsSection({ hourly24 }: { hourly24: HourlyChartPoint[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="border-border/80 bg-card/90">
        <CardHeader className="pb-2">
          <CardTitle className="font-display flex items-center gap-2 text-base font-bold">
            <Wind className="h-4 w-4 text-primary" />
            24-Hour Wind Speed &amp; Gusts (km/h)
          </CardTitle>
          <CardDescription className="text-xs">Live Open-Meteo hourly wind profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourly24} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.14} />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} unit="k" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="gustKmh" fill="#f97316" opacity={0.35} name="Gusts (km/h)" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="windKmh" stroke="#22d3ee" strokeWidth={2.2} dot={false} name="Wind (km/h)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="pb-2">
          <CardTitle className="font-display flex items-center gap-2 text-base font-bold">
            <Gauge className="h-4 w-4 text-emerald-400" />
            24-Hour Barometric Pressure (hPa) &amp; Swell (m)
          </CardTitle>
          <CardDescription className="text-xs">
            Falling or steady pressure (1010–1022 hPa) triggers peak feeding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourly24} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.14} />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 10 }} interval={3} />
                <YAxis yAxisId="p" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="s" orientation="right" domain={[0, 4]} tick={{ fontSize: 10 }} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar yAxisId="s" dataKey="swellM" fill="#38bdf8" opacity={0.35} name="Swell (m)" radius={[3, 3, 0, 0]} />
                <Line
                  yAxisId="p"
                  type="monotone"
                  dataKey="pressureHpa"
                  stroke="#10b981"
                  strokeWidth={2.2}
                  dot={false}
                  name="Pressure (hPa)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
