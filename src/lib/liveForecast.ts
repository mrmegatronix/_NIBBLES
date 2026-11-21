import { type NzFishingSpot } from '@/data/nzSpots125';
import {
  getDaySolunar,
  getDayTideExtrema,
  getRegionalTideHeight,
  type DaySolunarInfo,
} from '@/lib/solunar';

export type BiteLabel = 'PRIME' | 'GOOD' | 'FAIR' | 'POOR';
export type PressureTrend = 'rising' | 'steady' | 'falling';
export type SkyCondition = 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm';

export interface MatrixSlot {
  key: string;
  dayIndex: number;
  dayHeader: string;
  slotLabel: string; // 12am | 6am | 12pm | 6pm | Now
  isNow: boolean;
  hourOfDay: number;
  biteScore: number; // 0..10
  biteLabel: BiteLabel;
  fishCount: number; // 1..5
  solunarTag: 'MAJOR' | 'MINOR' | 'TWILIGHT' | null;
  solunarTooltip: string;
  tideText: string;
  tideHeightM: number;
  tideRising: boolean;
  swellM: number | null;
  swellPeriodS: number | null;
  swellDeg: number | null;
  swellCompass: string;
  windKmh: number;
  gustKmh: number;
  windDeg: number;
  windCompass: string;
  pressureHpa: number;
  pressureTrend: PressureTrend;
  tempC: number;
  rainPct: number;
  sky: SkyCondition;
  uvIndex: number;
}

export interface DaySummary {
  dayIndex: number;
  shortDay: string; // Mon, Tue
  dateLabel: string; // Today 22, Mon 23
  solunar: DaySolunarInfo;
  avgBiteScore: number;
  fishCount: number; // 1..5
  pressureHpa: number;
  pressureTrend: PressureTrend;
  sstC: number | null;
  highC: number;
  lowC: number;
  maxWindKmh: number;
}

export interface HourlyChartPoint {
  hourLabel: string;
  hourNum: number;
  tideM: number;
  windKmh: number;
  gustKmh: number;
  pressureHpa: number;
  swellM: number | null;
  tempC: number;
}

export interface SpotForecastBundle {
  spot: NzFishingSpot;
  fetchedAt: string;
  currentScore: number;
  currentLabel: BiteLabel;
  currentFishCount: number;
  currentTempC: number;
  currentWindKmh: number;
  currentWindDir: string;
  currentSwellM: number | null;
  currentSstC: number | null;
  currentPressureHpa: number;
  currentPressureTrend: PressureTrend;
  todaySolunar: DaySolunarInfo;
  hourly24: HourlyChartPoint[];
  days: DaySummary[];
  matrixSlots: MatrixSlot[];
}

export function degToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

function wmoToSky(code: number): SkyCondition {
  if (code <= 1) return 'clear';
  if (code <= 2) return 'partly-cloudy';
  if (code <= 48) return 'cloudy';
  if (code >= 95) return 'storm';
  return 'rain';
}

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function classifyBite(score: number): { label: BiteLabel; fishCount: number } {
  if (score >= 7.8) return { label: 'PRIME', fishCount: 5 };
  if (score >= 6.4) return { label: 'GOOD', fishCount: 4 };
  if (score >= 5.0) return { label: 'FAIR', fishCount: 3 };
  if (score >= 3.8) return { label: 'POOR', fishCount: 2 };
  return { label: 'POOR', fishCount: 1 };
}

function computeSlotBiteScore(params: {
  hour: number;
  solunar: DaySolunarInfo;
  tideSlopeAbs: number;
  pressureHpa: number;
  pressureTrend: PressureTrend;
  windKmh: number;
  windDeg: number;
  offshoreDeg: number;
  swellM: number | null;
  uvIndex: number;
}): { score: number; solunarTag: MatrixSlot['solunarTag']; solunarTooltip: string } {
  // 1. Solunar Activity (0..3.6) — check proximity to the slot's center hour
  const slotCenter = params.hour + 1.5;
  let solScore = 0.8 + params.solunar.lunarSynergyScore * 0.6;
  let solunarTag: MatrixSlot['solunarTag'] = null;
  let solunarTooltip = `${params.solunar.maramatakaName} (${params.solunar.maramatakaRating})`;

  for (const w of params.solunar.windows) {
    const peakHr = (w.startHour + w.endHour) / 2;
    const dist = Math.min(Math.abs(peakHr - slotCenter), 24 - Math.abs(peakHr - slotCenter));
    if (w.kind === 'MAJOR' && dist <= 2.2) {
      solScore = Math.max(solScore, 2.8 + params.solunar.lunarSynergyScore * 0.8);
      solunarTag = 'MAJOR';
      solunarTooltip = `${w.label} peak ${w.peakTime}`;
    } else if (w.kind === 'MINOR' && dist <= 1.8 && solunarTag !== 'MAJOR') {
      solScore = Math.max(solScore, 2.0 + params.solunar.lunarSynergyScore * 0.5);
      solunarTag = 'MINOR';
      solunarTooltip = `${w.label} peak ${w.peakTime}`;
    }
  }

  // Dawn/Dusk Twilight overlap bonus
  const hitsDawn = Math.abs(params.solunar.sunriseHour - slotCenter) <= 2.0;
  const hitsDusk = Math.abs(params.solunar.sunsetHour - slotCenter) <= 2.2;
  if (hitsDawn || hitsDusk) {
    solScore = Math.min(3.8, solScore + 0.7);
    if (!solunarTag) {
      solunarTag = 'TWILIGHT';
      solunarTooltip = hitsDawn ? `Dawn window (${params.solunar.sunrise})` : `Dusk window (${params.solunar.sunset})`;
    }
  }

  // 2. Tidal Movement (0..2.0)
  const tideScore = Math.min(2.0, 0.5 + params.tideSlopeAbs * 3.4);

  // 3. Barometric Pressure & Trend (0..1.8)
  let pressScore = 1.1;
  if (params.pressureTrend === 'falling' && params.pressureHpa >= 1004) pressScore = 1.8;
  else if (params.pressureTrend === 'steady' && params.pressureHpa >= 1010 && params.pressureHpa <= 1022) pressScore = 1.4;
  else if (params.pressureHpa > 1025) pressScore = 0.8;
  else if (params.pressureTrend === 'rising') pressScore = 1.0;
  else pressScore = 0.6;

  // 4. Wind & Swell Fishability (0..2.0)
  const offDiff = angleDiff(params.windDeg, params.offshoreDeg);
  const isOffshore = offDiff <= 75;
  let windScore = 1.0;
  if (params.windKmh <= 12) windScore = 1.2;
  else if (params.windKmh <= 20) windScore = isOffshore ? 1.0 : 0.6;
  else if (params.windKmh <= 30) windScore = isOffshore ? 0.55 : 0.25;
  else windScore = 0.1;

  let swellScore = 0.8;
  if (params.swellM != null) {
    if (params.swellM <= 1.0) swellScore = 0.8;
    else if (params.swellM <= 1.8) swellScore = 0.5;
    else if (params.swellM <= 2.6) swellScore = 0.25;
    else swellScore = 0.05;
  }

  // Bright midday UV glare penalty for shallow coastal waters
  const glarePenalty = params.hour === 12 && params.uvIndex >= 5 ? 0.9 : 0;

  const total = Math.max(
    1.5,
    Math.min(9.6, solScore + tideScore + pressScore + windScore + swellScore - glarePenalty)
  );
  return {
    score: Number(total.toFixed(1)),
    solunarTag,
    solunarTooltip,
  };
}

export async function fetchSpotForecast(spot: NzFishingSpot): Promise<SpotForecastBundle> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lng}&hourly=temperature_2m,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=Pacific%2FAuckland&forecast_days=7`;
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lng}&hourly=wave_height,wave_period,wave_direction,sea_surface_temperature&timezone=Pacific%2FAuckland&forecast_days=7`;

  const [wRes, mRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(marineUrl).catch(() => null),
  ]);

  if (!wRes.ok) {
    throw new Error(`Open-Meteo Weather API error (HTTP ${wRes.status})`);
  }

  const wData = await wRes.json();
  const mData = mRes && mRes.ok ? await mRes.json() : null;

  const hTimes: string[] = wData.hourly.time;
  const hTemp: number[] = wData.hourly.temperature_2m;
  const hRain: number[] = wData.hourly.precipitation_probability;
  const hCode: number[] = wData.hourly.weather_code;
  const hPress: number[] = wData.hourly.surface_pressure;
  const hWind: number[] = wData.hourly.wind_speed_10m;
  const hGust: number[] = wData.hourly.wind_gusts_10m;
  const hWindDir: number[] = wData.hourly.wind_direction_10m;
  const hUv: number[] = wData.hourly.uv_index;

  const mWave: Array<number | null> = mData?.hourly?.wave_height ?? [];
  const mPeriod: Array<number | null> = mData?.hourly?.wave_period ?? [];
  const mDir: Array<number | null> = mData?.hourly?.wave_direction ?? [];
  const mSst: Array<number | null> = mData?.hourly?.sea_surface_temperature ?? [];

  const now = new Date();
  const nowNzHour = Number(
    new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', hour12: false }).format(now)
  );
  const currentSlotBlock = Math.floor(nowNzHour / 6) * 6; // 0, 6, 12, 18

  const getTrend = (idx: number): PressureTrend => {
    const prevIdx = Math.max(0, idx - 3);
    const diff = (hPress[idx] ?? 1015) - (hPress[prevIdx] ?? 1015);
    if (diff >= 1.2) return 'rising';
    if (diff <= -1.2) return 'falling';
    return 'steady';
  };

  // Build 24h Hourly Graph for Today
  const hourly24: HourlyChartPoint[] = [];
  for (let hr = 0; hr < 24 && hr < hTimes.length; hr++) {
    const dt = new Date(hTimes[hr]);
    hourly24.push({
      hourLabel: `${String(hr).padStart(2, '0')}:00`,
      hourNum: hr,
      tideM: getRegionalTideHeight(dt, spot.tideOffsetHrs),
      windKmh: Math.round(hWind[hr] ?? 0),
      gustKmh: Math.round(hGust[hr] ?? 0),
      pressureHpa: Math.round(hPress[hr] ?? 1015),
      swellM: mWave[hr] != null ? Number(Number(mWave[hr]).toFixed(1)) : null,
      tempC: Math.round(hTemp[hr] ?? 15),
    });
  }

  const days: DaySummary[] = [];
  const matrixSlots: MatrixSlot[] = [];

  for (let d = 0; d < 7; d++) {
    const dayStartIdx = d * 24;
    if (dayStartIdx >= hTimes.length) break;

    const dayDate = new Date(hTimes[dayStartIdx]);
    const solunar = getDaySolunar(dayDate, spot.lat, spot.lng);
    const extrema = getDayTideExtrema(dayDate, spot.tideOffsetHrs);

    const shortDay = dayDate.toLocaleDateString('en-NZ', { weekday: 'short' });
    const dayNum = dayDate.getDate();
    const dayHeader = d === 0 ? `Today ${dayNum}` : `${shortDay} ${dayNum}`;

    const dayScores: number[] = [];

    for (const blockHr of [0, 6, 12, 18]) {
      const idx = Math.min(hTimes.length - 1, dayStartIdx + blockHr);
      const slotDate = new Date(hTimes[idx]);
      const tideNow = getRegionalTideHeight(slotDate, spot.tideOffsetHrs);
      const tideNext = getRegionalTideHeight(new Date(slotDate.getTime() + 3600000), spot.tideOffsetHrs);
      const tideSlopeAbs = Math.abs(tideNext - tideNow);
      const tideRising = tideNext >= tideNow;

      // Nearest tide extrema inside this 6h window
      const inWindowExtrema = extrema.find((ex) => ex.hour >= blockHr && ex.hour < blockHr + 6);
      const tideText = inWindowExtrema
        ? `${inWindowExtrema.type} ${inWindowExtrema.time} ${inWindowExtrema.height.toFixed(1)}m`
        : `${tideRising ? '↑' : '↓'} ${tideNow.toFixed(1)}m`;

      const pHpa = Math.round(hPress[idx] ?? 1015);
      const pTrend = getTrend(idx);
      const swellVal = mWave[idx] != null ? Number(Number(mWave[idx]).toFixed(1)) : null;
      const periodVal = mPeriod[idx] != null ? Math.round(Number(mPeriod[idx])) : null;
      const swellDegVal = mDir[idx] != null ? Math.round(Number(mDir[idx])) : null;

      const { score, solunarTag, solunarTooltip } = computeSlotBiteScore({
        hour: blockHr,
        solunar,
        tideSlopeAbs,
        pressureHpa: pHpa,
        pressureTrend: pTrend,
        windKmh: Math.round(hWind[idx] ?? 0),
        windDeg: Math.round(hWindDir[idx] ?? 0),
        offshoreDeg: spot.offshoreDeg,
        swellM: swellVal,
        uvIndex: Math.round(hUv[idx] ?? 0),
      });

      dayScores.push(score);
      const { label: biteLabel, fishCount } = classifyBite(score);
      const isNow = d === 0 && blockHr === currentSlotBlock;
      const slotLabel = isNow
        ? 'Now'
        : blockHr === 0
          ? '12am'
          : blockHr === 6
            ? '6am'
            : blockHr === 12
              ? '12pm'
              : '6pm';

      matrixSlots.push({
        key: `${d}-${blockHr}`,
        dayIndex: d,
        dayHeader,
        slotLabel,
        isNow,
        hourOfDay: blockHr,
        biteScore: score,
        biteLabel,
        fishCount,
        solunarTag,
        solunarTooltip,
        tideText,
        tideHeightM: tideNow,
        tideRising,
        swellM: swellVal,
        swellPeriodS: periodVal,
        swellDeg: swellDegVal,
        swellCompass: swellDegVal != null ? degToCompass(swellDegVal) : '--',
        windKmh: Math.round(hWind[idx] ?? 0),
        gustKmh: Math.round(hGust[idx] ?? 0),
        windDeg: Math.round(hWindDir[idx] ?? 0),
        windCompass: degToCompass(hWindDir[idx] ?? 0),
        pressureHpa: pHpa,
        pressureTrend: pTrend,
        tempC: Math.round(hTemp[idx] ?? 15),
        rainPct: Math.round(hRain[idx] ?? 0),
        sky: wmoToSky(hCode[idx] ?? 0),
        uvIndex: Math.round(hUv[idx] ?? 0),
      });
    }

    const avgBiteScore = Number(
      (dayScores.reduce((a, b) => a + b, 0) / Math.max(1, dayScores.length)).toFixed(1)
    );
    const middayIdx = Math.min(hTimes.length - 1, dayStartIdx + 12);
    const sstRaw = mSst[middayIdx];

    days.push({
      dayIndex: d,
      shortDay,
      dateLabel: dayHeader,
      solunar,
      avgBiteScore,
      fishCount: classifyBite(avgBiteScore).fishCount,
      pressureHpa: Math.round(hPress[middayIdx] ?? 1015),
      pressureTrend: getTrend(middayIdx),
      sstC: sstRaw != null ? Number(Number(sstRaw).toFixed(1)) : null,
      highC: Math.round(wData.daily.temperature_2m_max[d] ?? 18),
      lowC: Math.round(wData.daily.temperature_2m_min[d] ?? 9),
      maxWindKmh: Math.round(wData.daily.wind_speed_10m_max[d] ?? 15),
    });
  }

  const nowSlot = matrixSlots.find((s) => s.isNow) ?? matrixSlots[0];
  const nowIdx = Math.min(hTimes.length - 1, nowNzHour);

  return {
    spot,
    fetchedAt: new Date().toLocaleTimeString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    currentScore: nowSlot?.biteScore ?? 6.5,
    currentLabel: nowSlot?.biteLabel ?? 'GOOD',
    currentFishCount: nowSlot?.fishCount ?? 4,
    currentTempC: Math.round(hTemp[nowIdx] ?? 15),
    currentWindKmh: Math.round(hWind[nowIdx] ?? 0),
    currentWindDir: degToCompass(hWindDir[nowIdx] ?? 0),
    currentSwellM: mWave[nowIdx] != null ? Number(Number(mWave[nowIdx]).toFixed(1)) : null,
    currentSstC: mSst[nowIdx] != null ? Number(Number(mSst[nowIdx]).toFixed(1)) : null,
    currentPressureHpa: Math.round(hPress[nowIdx] ?? 1015),
    currentPressureTrend: getTrend(nowIdx),
    todaySolunar: days[0]?.solunar ?? getDaySolunar(now, spot.lat, spot.lng),
    hourly24,
    days,
    matrixSlots,
  };
}
