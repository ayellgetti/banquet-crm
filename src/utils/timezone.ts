function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  );

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asUtc - date.getTime();
}

export function getDateKeyInTimezone(timeZone: string, date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

export function getDayBoundsInTimezone(timeZone: string, referenceDate = new Date()) {
  const dateKey = getDateKeyInTimezone(timeZone, referenceDate);
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcMidnightGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const offset = getTimezoneOffsetMs(timeZone, utcMidnightGuess);
  const start = new Date(utcMidnightGuess.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

  return { start, end, dateKey };
}

export function getStartOfTodayInTimezone(timeZone: string): Date {
  return getDayBoundsInTimezone(timeZone).start;
}

export function getMonthBoundsInTimezone(timeZone: string, referenceDate = new Date()) {
  const dateKey = getDateKeyInTimezone(timeZone, referenceDate);
  const [year, month] = dateKey.split('-').map(Number);
  const startKey = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endKey = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const start = getDayBoundsInTimezone(timeZone, new Date(`${startKey}T00:00:00.000Z`)).start;
  const end = getDayBoundsInTimezone(timeZone, new Date(`${endKey}T00:00:00.000Z`)).end;

  return { start, end, startKey, endKey, year, month };
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
