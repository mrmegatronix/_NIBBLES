import { useEffect, useState } from 'react';

export function BlinkingClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hh = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const mm = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const ss = parts.find((p) => p.type === 'second')?.value ?? '00';

  return (
    <span className="font-mono text-sm font-semibold tracking-tight whitespace-nowrap tabular-nums sm:text-base">
      {hh}
      <span className="colon-blink text-primary">:</span>
      {mm}
      <span className="colon-blink text-primary">:</span>
      {ss}
    </span>
  );
}
