const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function asUtcDate(dateString) {
  if (!DATE_PATTERN.test(dateString)) {
    throw new TypeError(`Expected YYYY-MM-DD, received ${dateString}`);
  }
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.toISOString().slice(0, 10) !== dateString) {
    throw new TypeError(`Invalid calendar date ${dateString}`);
  }
  return date;
}

function dateString(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

function observedFixedDate(year, monthIndex, day) {
  const date = new Date(Date.UTC(year, monthIndex, day, 12));
  if (date.getUTCDay() === 6) return dateString(addDays(date, -1));
  if (date.getUTCDay() === 0) return dateString(addDays(date, 1));
  return dateString(date);
}

function nthWeekday(year, monthIndex, weekday, ordinal) {
  const first = new Date(Date.UTC(year, monthIndex, 1, 12));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return dateString(addDays(first, offset + (ordinal - 1) * 7));
}

function lastWeekday(year, monthIndex, weekday) {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0, 12));
  return dateString(addDays(last, -((last.getUTCDay() - weekday + 7) % 7)));
}

// Gregorian Easter, Meeus/Jones/Butcher algorithm.
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function usEquityHolidays(year) {
  const holidays = new Set([
    observedFixedDate(year, 0, 1),
    nthWeekday(year, 0, 1, 3),
    nthWeekday(year, 1, 1, 3),
    dateString(addDays(easterSunday(year), -2)),
    lastWeekday(year, 4, 1),
    observedFixedDate(year, 6, 4),
    nthWeekday(year, 8, 1, 1),
    nthWeekday(year, 10, 4, 4),
    observedFixedDate(year, 11, 25)
  ]);

  if (year >= 2022) holidays.add(observedFixedDate(year, 5, 19));

  // A Saturday New Year's Day can be observed on December 31 of this year.
  const nextNewYearObserved = observedFixedDate(year + 1, 0, 1);
  if (nextNewYearObserved.startsWith(`${year}-`)) holidays.add(nextNewYearObserved);

  return holidays;
}

export function isUsEquitySessionDate(
  date,
  { additionalClosedDates = [], forcedOpenDates = [] } = {}
) {
  const parsed = asUtcDate(date);
  if (forcedOpenDates.includes(date)) return true;
  if (additionalClosedDates.includes(date)) return false;
  const day = parsed.getUTCDay();
  if (day === 0 || day === 6) return false;
  return !usEquityHolidays(parsed.getUTCFullYear()).has(date);
}

export function dateInTimeZone(timestamp, timeZone = "America/Los_Angeles") {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) throw new TypeError(`Invalid timestamp ${timestamp}`);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
