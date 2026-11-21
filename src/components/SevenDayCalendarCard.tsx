import { ArrowDownRight, ArrowRight, ArrowUpRight, Fish } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type DaySummary } from '@/lib/liveForecast';

interface SevenDayCalendarCardProps {
  days: DaySummary[];
  activeDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
}

export function SevenDayCalendarCard({
  days,
  activeDayIndex,
  onSelectDay,
}: SevenDayCalendarCardProps) {
  return (
    <Card className="h-full border-border/80 bg-card/90">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-display text-base font-bold">7-Day Fishing Calendar</CardTitle>
          <span className="font-mono text-[10px] text-muted-foreground">Click day to jump</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {days.map((d) => {
          const TrendIcon =
            d.pressureTrend === 'rising'
              ? ArrowUpRight
              : d.pressureTrend === 'falling'
                ? ArrowDownRight
                : ArrowRight;
          const trendColor =
            d.pressureTrend === 'falling'
              ? 'text-emerald-400'
              : d.pressureTrend === 'rising'
                ? 'text-cyan-400'
                : 'text-muted-foreground';

          return (
            <button
              key={d.dayIndex}
              type="button"
              onClick={() => onSelectDay(d.dayIndex)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs transition ${
                activeDayIndex === d.dayIndex
                  ? 'bg-primary/15 ring-1 ring-primary/40'
                  : 'hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 text-left font-semibold whitespace-nowrap">{d.shortDay}</span>
                <span className="text-sm leading-none" title={d.solunar.phaseName}>
                  {d.solunar.emoji}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Fish
                      key={i}
                      className={`h-3 w-3 ${
                        i <= d.fishCount ? 'fill-cyan-400 text-cyan-400' : 'text-muted-foreground/25'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums whitespace-nowrap">
                <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                  {d.pressureHpa}
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                </span>
                <span className="w-11 text-right font-semibold text-foreground">
                  {d.sstC != null ? `${d.sstC}°C` : `${d.highC}°C`}
                </span>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
