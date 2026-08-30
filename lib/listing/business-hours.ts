export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface BusinessShift {
  openTime: string;
  closeTime: string;
}

export interface BusinessDay {
  isClosed: boolean;
  shifts: BusinessShift[];
}

export type BusinessHours = Record<DayOfWeek, BusinessDay>;

export const DAY_INDEX: Record<DayOfWeek, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

const DEFAULT_SHIFT: BusinessShift = { openTime: '09:00', closeTime: '17:00' };

export function defaultBusinessHours(): BusinessHours {
  return DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = {
      isClosed: false,
      shifts: [{ ...DEFAULT_SHIFT }],
    };
    return acc;
  }, {} as BusinessHours);
}

function formatGoogleTime(time: string | undefined): string {
  if (!time || time.length < 4) {
    return '09:00';
  }
  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
}

/** Google Places uses Sunday = 0; clinic_hours uses Monday = 0. */
function googleDayToDashboard(day: number): DayOfWeek {
  return DAYS_OF_WEEK[(day + 6) % 7];
}

export type GoogleOpeningPeriod = {
  open?: { day?: number; time?: string };
  close?: { day?: number; time?: string };
};

export function mapGooglePeriodsToBusinessHours(
  periods: GoogleOpeningPeriod[] | undefined,
): BusinessHours {
  if (!periods?.length) {
    return defaultBusinessHours();
  }

  const hours = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = { isClosed: true, shifts: [] };
    return acc;
  }, {} as BusinessHours);

  for (const period of periods) {
    if (period.open?.day === undefined) {
      continue;
    }
    const day = googleDayToDashboard(period.open.day);
    const openTime = formatGoogleTime(period.open.time);
    const closeTime = formatGoogleTime(period.close?.time);
    hours[day].isClosed = false;
    hours[day].shifts.push({ openTime, closeTime });
  }

  return hours;
}

export function businessHoursToInsertRows(
  clinicId: string,
  businessHours: BusinessHours,
): Array<{
  clinic_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
}> {
  const rows: Array<{
    clinic_id: string;
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
  }> = [];

  for (const day of DAYS_OF_WEEK) {
    const dayData = businessHours[day];
    if (!dayData || dayData.isClosed || dayData.shifts.length === 0) {
      rows.push({
        clinic_id: clinicId,
        day_of_week: DAY_INDEX[day],
        open_time: null,
        close_time: null,
      });
      continue;
    }

    for (const shift of dayData.shifts) {
      rows.push({
        clinic_id: clinicId,
        day_of_week: DAY_INDEX[day],
        open_time: shift.openTime || null,
        close_time: shift.closeTime || null,
      });
    }
  }

  return rows;
}
