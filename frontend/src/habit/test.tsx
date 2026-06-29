import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

import { type Habit, type HabitLog } from "./habitModel";
import {
  type AppSettings,
  defaultSettings,
} from "../model/settings";
import { SyncStatus } from "../model/syncStatus";

/* =========================
   Store Type
========================= */

export type HabitStore = {
  habits: Habit[];
  logs: HabitLog[];
  settings: AppSettings;

  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  addLog: (log: HabitLog) => void;
  updateLog: (id: string, updates: Partial<HabitLog>) => void;
  deleteLog: (id: string) => void;

  getLogsForHabit: (habitId: string) => HabitLog[];
  getLogsForDate: (date: string) => HabitLog[];

  markLogSynced: (id: string) => void;
  markLogError: (id: string) => void;

  updateSettings: (updates: Partial<AppSettings>) => void;

  resetStore: () => void;
};

/* =========================
   Vanilla Store
========================= */

export const habitStore = createStore<HabitStore>((set, get) => ({
  habits: [],
  logs: [],
  settings: defaultSettings,

  /* =====================
     Habits
  ===================== */

  addHabit: (habit) =>
    set((s) => ({ habits: [...s.habits, habit] })),

  updateHabit: (id, updates) =>
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    })),

  archiveHabit: (id) =>
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, archived: true } : h
      ),
    })),

  deleteHabit: (id) =>
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      logs: s.logs.filter((l) => l.habitId !== id),
    })),

  /* =====================
     Logs
  ===================== */

  addLog: (log) =>
    set((s) => ({ logs: [...s.logs, log] })),

  updateLog: (id, updates) =>
    set((s) => ({
      logs: s.logs.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  deleteLog: (id) =>
    set((s) => ({
      logs: s.logs.filter((l) => l.id !== id),
    })),

  /* =====================
     Queries
  ===================== */

  getLogsForHabit: (habitId) =>
    get().logs.filter((l) => l.habitId === habitId),

  getLogsForDate: (date) =>
    get().logs.filter((l) => l.date === date),

  /* =====================
     Sync
  ===================== */

  markLogSynced: (id) =>
    set((s) => ({
      logs: s.logs.map((l) =>
        l.id === id
          ? {
              ...l,
              syncStatus: SyncStatus.Synced,
              syncedAt: new Date().toISOString(),
            }
          : l
      ),
    })),

  markLogError: (id) =>
    set((s) => ({
      logs: s.logs.map((l) =>
        l.id === id
          ? { ...l, syncStatus: SyncStatus.Error }
          : l
      ),
    })),

  /* =====================
     Settings
  ===================== */

  updateSettings: (updates) =>
    set((s) => ({
      settings: { ...s.settings, ...updates },
    })),

  /* =====================
     Reset
  ===================== */

  resetStore: () =>
    set({
      habits: [],
      logs: [],
      settings: defaultSettings,
    }),
}));