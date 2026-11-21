import * as SunCalc from 'suncalc';

export interface SolunarWindow {
  kind: 'MAJOR' | 'MINOR';
  label: string;
  startHour: number; // 0..24 decimal
  endHour: number;   // 0..24 decimal
  peakTime: string;  // HH:mm
}

export interface DaySolunarInfo {
  dateIso: string;
  phaseName: string;
  illuminationPct: number;
  lunarDay: number; // 1..30
  emoji: string;
  maramatakaName: string;
  maramatakaRating: 'Excellent' | 'Good' | 'Fair' | 'Quiet';
  sunrise: string;
  sunset: string;
  sunriseHour: number;
  sunsetHour: number;
  moonrise: string | null;
  moonset: string | null;
  windows: SolunarWindow[];
  lunarSynergyScore: number; // 0..1.0
}

const MARAMATAKA_DAYS: Array<{ name: string; rating: DaySolunarInfo['maramatakaRating'] }> = [
  { name: 'Whiro', rating: 'Quiet' },
  { name: 'Tirea', rating: 'Fair' },
  { name: 'Hoata', rating: 'Good' },
  { name: 'Ouenuku', rating: 'Good' },
  { name: 'Okoro', rating: 'Good' },
  { name: 'Tamatea-ā-ngana', rating: 'Fair' },
  { name: 'Tamatea-a-hotu', rating: 'Fair' },
  { name: 'Tamatea-ā-io', rating: 'Fair' },
  { name: 'Tamatea-whakapau', rating: 'Quiet' },
  { name: 'Huna', rating: 'Quiet' },
  { name: 'Ariroa', rating: 'Good' },
  { name: 'Hotu', rating: 'Good' },
  { name: 'Mawharu', rating: 'Excellent' },
  { name: 'Atua', rating: 'Quiet' },
  { name: 'Ohua', rating: 'Good' },
  { name: 'Oturu', rating: 'Excellent' },
  { name: 'Rākaunui', rating: 'Excellent' },
  { name: 'Rākaumatohi', rating: 'Good' },
  { name: 'Takirau', rating: 'Fair' },
  { name: 'Oike', rating: 'Fair' },
  { name: 'Korekore-te-whiwhia', rating: 'Quiet' },
  { name: 'Korekore-te-rawea', rating: 'Quiet' },
  { name: 'Korekore-piri-ki-ngā-Tangaroa', rating: 'Fair' },
  { name: 'Tangaroa-a-mua', rating: 'Excellent' },
  { name: 'Tangaroa-a-roto', rating: 'Excellent' },
  { name: 'Tangaroa-kiokio', rating: 'Excellent' },
  { name: 'Ōtāne', rating: 'Good' },
  { name: 'Ōrongonui', rating: 'Good' },
  { name: 'Mauri', rating: 'Fair' },
  { name: 'Mutuwhenua', rating: 'Quiet' },
];

function fmtHourMin(d: Date | null | undefined): string {
  if (!d || Number.isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function toDecimalHourNZ(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return h + m / 60;
}

export function getDaySolunar(date: Date, lat: number, lng: number): DaySolunarInfo {
  // Normalize to midday local NZT for stable phase/times
  const base = new Date(date);
  base.setHours(12, 0, 0, 0);

  const illum = SunCalc.getMoonIllumination(base);
  const phase = illum.phase; // 0..1
  const illuminationPct = Math.round(illum.fraction * 100);
  const lunarDay = Math.min(30, Math.max(1, Math.floor(phase * 30) + 1));
  const maramataka = MARAMATAKA_DAYS[lunarDay - 1] ?? MARAMATAKA_DAYS[0];

  let phaseName = 'New Moon';
  let emoji = '🌑';
  if (phase < 0.0625 || phase >= 0.9375) {
    phaseName = 'New Moon';
    emoji = '🌑';
  } else if (phase < 0.1875) {
    phaseName = 'Waxing Crescent';
    emoji = '🌒';
  } else if (phase < 0.3125) {
    phaseName = 'First Quarter';
    emoji = '🌓';
  } else if (phase < 0.4375) {
    phaseName = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (phase < 0.5625) {
    phaseName = 'Full Moon';
    emoji = '🌕';
  } else if (phase < 0.6875) {
    phaseName = 'Waning Gibbous';
    emoji = '🌖';
  } else if (phase < 0.8125) {
    phaseName = 'Last Quarter';
    emoji = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    emoji = '🌘';
  }

  const sunTimes = SunCalc.getTimes(base, lat, lng);
  const moonTimes = SunCalc.getMoonTimes(base, lat, lng);

  // Solve exact Moon Overhead (max altitude) and Underfoot (min altitude) across the 24h day (10-min step)
  const dayStart = new Date(base);
  dayStart.setHours(0, 0, 0, 0);

  let maxAlt = -Infinity;
  let minAlt = Infinity;
  let overheadTime = new Date(dayStart.getTime() + 12 * 3600000);
  let underfootTime = new Date(dayStart.getTime() + 0 * 3600000);

  for (let mins = 0; mins < 1440; mins += 10) {
    const t = new Date(dayStart.getTime() + mins * 60000);
    const pos = SunCalc.getMoonPosition(t, lat, lng);
    if (pos.altitude > maxAlt) {
      maxAlt = pos.altitude;
      overheadTime = t;
    }
    if (pos.altitude < minAlt) {
      minAlt = pos.altitude;
      underfootTime = t;
    }
  }

  const windows: SolunarWindow[] = [];
  const addWindow = (kind: 'MAJOR' | 'MINOR', label: string, peak: Date, halfSpanHrs: number) => {
    const peakHr = toDecimalHourNZ(peak);
    windows.push({
      kind,
      label,
      startHour: Math.max(0, peakHr - halfSpanHrs),
      endHour: Math.min(24, peakHr + halfSpanHrs),
      peakTime: fmtHourMin(peak),
    });
  };

  addWindow('MAJOR', 'Moon Overhead', overheadTime, 1.0);
  addWindow('MAJOR', 'Moon Underfoot', underfootTime, 1.0);
  if (moonTimes.rise) addWindow('MINOR', 'Moonrise', moonTimes.rise, 0.5);
  if (moonTimes.set) addWindow('MINOR', 'Moonset', moonTimes.set, 0.5);

  windows.sort((a, b) => a.startHour - b.startHour);

  // Peak lunar synergy near New Moon (0/1) or Full Moon (0.5)
  const distToNewOrFull = Math.min(phase, Math.abs(phase - 0.5), 1 - phase);
  const lunarSynergyScore = Number(Math.max(0.25, 1 - distToNewOrFull * 3.0).toFixed(2));

  return {
    dateIso: base.toISOString().slice(0, 10),
    phaseName,
    illuminationPct,
    lunarDay,
    emoji,
    maramatakaName: maramataka.name,
    maramatakaRating: maramataka.rating,
    sunrise: fmtHourMin(sunTimes.sunrise),
    sunset: fmtHourMin(sunTimes.sunset),
    sunriseHour: sunTimes.sunrise ? toDecimalHourNZ(sunTimes.sunrise) : 6.0,
    sunsetHour: sunTimes.sunset ? toDecimalHourNZ(sunTimes.sunset) : 20.0,
    moonrise: moonTimes.rise ? fmtHourMin(moonTimes.rise) : null,
    moonset: moonTimes.set ? fmtHourMin(moonTimes.set) : null,
    windows,
    lunarSynergyScore,
  };
}

// 5-Constituent Harmonic Tide Model calibrated to NZ regional phase offset
export function getRegionalTideHeight(date: Date, tideOffsetHrs: number): number {
  const shiftedMs = date.getTime() + tideOffsetHrs * 3600000;
  const hours = (shiftedMs - Date.UTC(2026, 0, 1, 0, 0, 0)) / 3600000;
  const m2 = 0.88 * Math.cos((2 * Math.PI * hours) / 12.4206 - 0.8);
  const s2 = 0.22 * Math.cos((2 * Math.PI * hours) / 12.0 - 1.4);
  const n2 = 0.14 * Math.cos((2 * Math.PI * hours) / 12.6583 - 0.3);
  const k1 = 0.08 * Math.cos((2 * Math.PI * hours) / 23.9345 - 1.1);
  const o1 = 0.06 * Math.cos((2 * Math.PI * hours) / 25.8193 - 0.5);
  return Number(Math.max(0.1, 1.42 + m2 + s2 + n2 + k1 + o1).toFixed(2));
}

export interface TideExtrema {
  type: 'H' | 'L';
  time: string;
  hour: number;
  height: number;
}

export function getDayTideExtrema(date: Date, tideOffsetHrs: number): TideExtrema[] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const stepMs = 15 * 60000;
  let prevH = getRegionalTideHeight(new Date(start.getTime() - stepMs), tideOffsetHrs);
  let currH = getRegionalTideHeight(start, tideOffsetHrs);
  const results: TideExtrema[] = [];

  for (let i = 1; i <= 96; i++) {
    const t = new Date(start.getTime() + i * stepMs);
    const nextH = getRegionalTideHeight(t, tideOffsetHrs);
    const pt = new Date(start.getTime() + (i - 1) * stepMs);

    if (currH > prevH && currH >= nextH) {
      results.push({
        type: 'H',
        time: pt.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '').toLowerCase(),
        hour: (i - 1) * 0.25,
        height: currH,
      });
    } else if (currH < prevH && currH <= nextH) {
      results.push({
        type: 'L',
        time: pt.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '').toLowerCase(),
        hour: (i - 1) * 0.25,
        height: currH,
      });
    }
    prevH = currH;
    currH = nextH;
  }
  return results;
}
