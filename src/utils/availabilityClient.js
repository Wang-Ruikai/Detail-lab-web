// src/utils/availabilityClient.js
const CONFIG = {
  API_KEY: import.meta.env.VITE_GCAL_API_KEY,
  CALENDAR_ID: import.meta.env.VITE_GCAL_CAL_ID,
  SLOT_STEP_MIN: 15,
  OPEN_MIN: 9 * 60,
  CLOSE_MIN: 18 * 60,
  BUFFER_MIN: 0,
  LEAD_TIME_MIN: 60, // 当天需至少提前1小时
};

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export async function fetchDayEvents(ymd) {
  const { API_KEY, CALENDAR_ID } = CONFIG;
  if (!API_KEY || !CALENDAR_ID) throw new Error("Missing API key or calendar id");

  const timeMin = new Date(`${ymd}T00:00:00`);
  const timeMax = new Date(`${ymd}T23:59:59`);

  const params = new URLSearchParams({
    key: API_KEY,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    CALENDAR_ID
  )}/events?${params.toString()}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Calendar API error: ${resp.status}`);
  const data = await resp.json();

  return (data.items || []).map((it) => {
    const s = it.start.dateTime || `${it.start.date}T00:00:00`;
    const e = it.end.dateTime || `${it.end.date}T23:59:59`;
    return { start: new Date(s), end: new Date(e) };
  });
}

export async function getAvailableSlots(ymd, durationMin) {
  const { SLOT_STEP_MIN, OPEN_MIN, CLOSE_MIN, BUFFER_MIN, LEAD_TIME_MIN } = CONFIG;
  const now = new Date();
  const existing = await fetchDayEvents(ymd);

  const [y, m, d] = ymd.split("-").map(Number);
  const base = new Date(y, m - 1, d, 0, 0, 0, 0);
  const dayOpen = new Date(base); dayOpen.setMinutes(OPEN_MIN);
  const dayClose = new Date(base); dayClose.setMinutes(CLOSE_MIN);

  const out = [];
  for (
    let start = new Date(dayOpen);
    new Date(start.getTime() + durationMin * 60000) <= dayClose;
    start = new Date(start.getTime() + SLOT_STEP_MIN * 60000)
  ) {
    const end = new Date(start.getTime() + (durationMin + BUFFER_MIN) * 60000);

    if (ymd === now.toISOString().slice(0, 10)) {
      const lead = new Date(now.getTime() + LEAD_TIME_MIN * 60000);
      if (start < lead) continue;
    }

    const conflict = existing.some((ev) => overlap(start, end, ev.start, ev.end));
    if (!conflict) out.push(start);
  }
  return out;
}

export function setAvailabilityConfig(patch) {
  Object.assign(CONFIG, patch || {});
}
export const AVAILABILITY_CONFIG = CONFIG;
