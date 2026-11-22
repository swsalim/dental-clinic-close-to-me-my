export type ClinicAvailability = 'open' | 'closed' | 'opening-soon' | 'closing-soon';

export type AvailabilityHours = {
  day_of_week?: number | null;
  open_time?: string | null;
  close_time?: string | null;
};

export type AvailabilitySpecialHours = {
  date?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  is_closed?: boolean | null;
};

const WEEKDAYS: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function malaysiaClock(date: Date): { dayOfWeek: number; minutes: number; dateKey: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = Number(value.hour);
  const minute = Number(value.minute);

  return {
    dayOfWeek: WEEKDAYS[value.weekday] ?? 0,
    minutes: (hour === 24 ? 0 : hour) * 60 + minute,
    dateKey: `${value.year}-${value.month}-${value.day}`,
  };
}

function minutesFromTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function statusForWindow(
  openTime: string,
  closeTime: string,
  nowMinutes: number,
): ClinicAvailability | null {
  const open = minutesFromTime(openTime);
  const close = minutesFromTime(closeTime);
  if (open == null || close == null) return null;
  if (Math.abs(nowMinutes - close) <= 30) return 'closing-soon';
  if (Math.abs(nowMinutes - open) <= 30) return 'opening-soon';
  if (nowMinutes >= open && nowMinutes <= close) return 'open';
  return null;
}

export function getClinicAvailability(
  regularHours: AvailabilityHours[],
  specialHours: AvailabilitySpecialHours[],
  date: Date = new Date(),
): ClinicAvailability {
  const clock = malaysiaClock(date);
  const special = specialHours.find((entry) => entry.date === clock.dateKey);

  if (special) {
    if (special.is_closed || !special.open_time || !special.close_time) return 'closed';
    return statusForWindow(special.open_time, special.close_time, clock.minutes) ?? 'closed';
  }

  for (const shift of regularHours) {
    if (shift.day_of_week !== clock.dayOfWeek || !shift.open_time || !shift.close_time) continue;
    const status = statusForWindow(shift.open_time, shift.close_time, clock.minutes);
    if (status) return status;
  }

  return 'closed';
}

export function matchesHoursFilter(
  status: ClinicAvailability,
  hours: '' | 'open' | 'closed',
): boolean {
  if (hours === 'open') return status === 'open' || status === 'closing-soon';
  if (hours === 'closed') return status === 'closed' || status === 'opening-soon';
  return true;
}
