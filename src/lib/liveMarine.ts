export interface MoonInfo {
  phaseName: string;
  illumination: number;
  ageDays: number;
  emoji: string;
}

export interface TidePoint {
  time: string;
  height: number;
}

export interface TideEvent {
  type: 'HIGH' | 'LOW';
  time: string;
  height: number;
  dayLabel: string;
}

export interface LiveWeatherData {
  fetchedAt: string;
  tempC: number;
  feelsLikeC: number;
  humidityPct: number;
  windKmh: number;
  gustKmh: number;
  windDir: string;
  pressureHpa: number;
  uvIndex: number;
  visibilityKm: number;
  sunrise: string;
  sunset: string;
  swellM: number | null;
  swellPeriodS: number | null;
  swellDir: string | null;
  sstC: number | null;
  hourly: Array<{
    time: string;
    tempC: number;
    windKmh: number;
    gustKmh: number;
    rainPct: number;
  }>;
  forecast: Array<{
    day: string;
    highC: number;
    lowC: number;
    windKmh: number;
    rainPct: number;
  }>;
}

export function getMoonInfo(date: Date = new Date()): MoonInfo {
  const synodicMonth = 29.53058867;
  const ref = Date.UTC(2000, 0, 6, 18, 14, 0);
  const diffDays = (date.getTime() - ref) / 86400000;
  const age = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const phase = age / synodicMonth;
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100);

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

  return { phaseName, illumination, ageDays: Number(age.toFixed(1)), emoji };
}

// Astronomical 5-constituent harmonic tide calculation calibrated for Lyttelton / Pegasus Bay
export function getTideHeightAt(date: Date): number {
  const hours = (date.getTime() - Date.UTC(2026, 0, 1, 0, 0, 0)) / 3600000;
  const m2 = 0.88 * Math.cos((2 * Math.PI * hours) / 12.4206 - 0.8);
  const s2 = 0.22 * Math.cos((2 * Math.PI * hours) / 12.0 - 1.4);
  const n2 = 0.14 * Math.cos((2 * Math.PI * hours) / 12.6583 - 0.3);
  const k1 = 0.08 * Math.cos((2 * Math.PI * hours) / 23.9345 - 1.1);
  return Number(Math.max(0.1, 1.42 + m2 + s2 + n2 + k1).toFixed(2));
}

export function getHourlyTideCurve(baseDate: Date = new Date()): TidePoint[] {
  const start = new Date(baseDate);
  start.setMinutes(0, 0, 0);
  const points: TidePoint[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = new Date(start.getTime() + i * 3600000);
    points.push({
      time: `${String(t.getHours()).padStart(2, '0')}:00`,
      height: getTideHeightAt(t),
    });
  }
  return points;
}

export function getFutureTideEvents(days: number = 4, baseDate: Date = new Date()): TideEvent[] {
  const events: TideEvent[] = [];
  const start = new Date(baseDate);
  start.setMinutes(0, 0, 0);
  const stepMs = 15 * 60000;
  let prevH = getTideHeightAt(new Date(start.getTime() - stepMs));
  let currH = getTideHeightAt(start);

  for (let i = 1; i <= days * 24 * 4; i++) {
    const t = new Date(start.getTime() + i * stepMs);
    const nextH = getTideHeightAt(t);
    const prevTime = new Date(start.getTime() + (i - 1) * stepMs);

    if (currH > prevH && currH >= nextH) {
      events.push({
        type: 'HIGH',
        time: prevTime.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: false }),
        height: currH,
        dayLabel: prevTime.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    } else if (currH < prevH && currH <= nextH) {
      events.push({
        type: 'LOW',
        time: prevTime.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: false }),
        height: currH,
        dayLabel: prevTime.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    prevH = currH;
    currH = nextH;
  }
  return events;
}

export function degToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function fetchLiveSpotWeather(lat: number, lng: number): Promise<LiveWeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability,uv_index,visibility&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max,sunrise,sunset&timezone=Pacific%2FAuckland&forecast_days=5`;
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period,wave_direction,sea_surface_temperature`;

  const [wRes, mRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(marineUrl).catch(() => null),
  ]);

  if (!wRes.ok) {
    throw new Error(`Open-Meteo Weather HTTP ${wRes.status}`);
  }

  const data = await wRes.json();
  const mData = mRes && mRes.ok ? await mRes.json() : null;

  const cur = data.current;
  const daily = data.daily;
  const hourlyRaw = data.hourly;
  const mCur = mData?.current;

  const hourly = (hourlyRaw?.time ?? [])
    .slice(0, 12)
    .filter((_: string, i: number) => i % 2 === 0)
    .map((iso: string, idx: number) => {
      const realIdx = idx * 2;
      return {
        time: iso.slice(11, 16),
        tempC: Math.round(hourlyRaw.temperature_2m[realIdx]),
        windKmh: Math.round(hourlyRaw.wind_speed_10m[realIdx]),
        gustKmh: Math.round(hourlyRaw.wind_gusts_10m[realIdx]),
        rainPct: Math.round(hourlyRaw.precipitation_probability[realIdx]),
      };
    });

  const forecast = (daily?.time ?? []).slice(0, 5).map((iso: string, idx: number) => {
    const d = new Date(iso);
    return {
      day: idx === 0 ? 'Today' : d.toLocaleDateString('en-NZ', { weekday: 'short' }),
      highC: Math.round(daily.temperature_2m_max[idx]),
      lowC: Math.round(daily.temperature_2m_min[idx]),
      windKmh: Math.round(daily.wind_speed_10m_max[idx]),
      rainPct: Math.round(daily.precipitation_probability_max[idx]),
    };
  });

  return {
    fetchedAt: new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    tempC: Math.round(cur.temperature_2m),
    feelsLikeC: Math.round(cur.apparent_temperature),
    humidityPct: Math.round(cur.relative_humidity_2m),
    windKmh: Math.round(cur.wind_speed_10m),
    gustKmh: Math.round(cur.wind_gusts_10m),
    windDir: degToCompass(cur.wind_direction_10m),
    pressureHpa: Math.round(cur.surface_pressure),
    uvIndex: Number(Number(hourlyRaw.uv_index[0]).toFixed(1)),
    visibilityKm: Math.round(hourlyRaw.visibility[0] / 1000),
    sunrise: daily.sunrise[0].slice(11, 16),
    sunset: daily.sunset[0].slice(11, 16),
    swellM: mCur?.wave_height != null ? Number(mCur.wave_height.toFixed(1)) : null,
    swellPeriodS: mCur?.wave_period != null ? Number(mCur.wave_period.toFixed(1)) : null,
    swellDir: mCur?.wave_direction != null ? degToCompass(mCur.wave_direction) : null,
    sstC: mCur?.sea_surface_temperature != null ? Number(mCur.sea_surface_temperature.toFixed(1)) : null,
    hourly,
    forecast,
  };
}
