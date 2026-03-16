export const DEFAULT_TOPIC_PALETTE = [
  '#16302b',
  '#32746d',
  '#de6b48',
  '#6c8c57',
  '#6f5f90',
  '#946846',
  '#467599'
];

export const DEFAULT_TOPICS = [
  'Job Hunt',
  'Biology',
  'Computer Science',
  'Misc Work',
  'Amgen',
  'Exercise'
];

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function todayLocal() {
  return new Date().toISOString().slice(0, 10);
}

export function roundToQuarter(hours: number) {
  if (hours <= 0) {
    return 0;
  }

  return Math.max(0.25, Math.round(hours * 4) / 4);
}

export function formatHours(hours: number) {
  return `${hours.toFixed(2)} h`;
}

export function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}

export function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}