import type { HabitEntry } from '../types';
import { startOfWeek, todayLocal } from './utils';

export type EntrySummaryStats = {
  today: number;
  yesterday: number;
  week: number;
};

function dateOffsetIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function selectEntrySummaryStats(entries: HabitEntry[]): EntrySummaryStats {
  const today = todayLocal();
  const yesterday = dateOffsetIso(-1);
  const weekStart = startOfWeek(new Date());

  return entries.reduce(
    (accumulator, entry) => {
      if (entry.date === today) {
        accumulator.today += entry.hours;
      }

      if (entry.date === yesterday) {
        accumulator.yesterday += entry.hours;
      }

      if (new Date(entry.date) >= weekStart) {
        accumulator.week += entry.hours;
      }

      return accumulator;
    },
    { today: 0, yesterday: 0, week: 0 }
  );
}
