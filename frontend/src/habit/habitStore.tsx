
import { type Habit, type HabitLog } from "./habitModel";
import {
  type AppSettings,
  defaultSettings,
} from "../model/settings";
import { del } from "idb-keyval";
import { applicationStore } from '../store/appStore'
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

  updateSettings: (updates: Partial<AppSettings>) => void;

  resetStore: () => void;
};

// --- Exported Functional HabitStore Implementation ---
export const habitStore: HabitStore = {
  get habits() { return applicationStore.habits; },
  get logs() { return applicationStore.logs; },
  get settings() { return applicationStore.settings; },

  // --- Habit Actions ---
  addHabit(habit) {
    applicationStore.habits = [...applicationStore.habits, habit];
    applicationStore.persistLocally();
  },

  updateHabit(id, updates) {
    applicationStore.habits = applicationStore.habits.map((h) =>
      h.id === id ? { ...h, ...updates } : h
    );
    applicationStore.persistLocally();
  },

  archiveHabit(id) {
    this.updateHabit(id, { archived: true });
  },

  deleteHabit(id) {
    applicationStore.habits = applicationStore.habits.filter((h) => h.id !== id);
    applicationStore.persistLocally();
  },

  // --- Log Actions ---
  addLog(log) {
    applicationStore.logs = [...applicationStore.logs, log];
    applicationStore.persistLocally();
    applicationStore.syncPendingLogsWithSheets();
  },

  updateLog(id, updates) {
    applicationStore.logs = applicationStore.logs.map((l) =>
      l.id === id ? { ...l, ...updates, syncStatus: SyncStatus.Pending } : l
    );
    applicationStore.persistLocally();
    applicationStore.syncPendingLogsWithSheets();
  },

  deleteLog(id) {
    applicationStore.logs = applicationStore.logs.filter((l) => l.id !== id);
    applicationStore.persistLocally();
  },

  // --- Read Queries ---
  getLogsForHabit(habitId) {
    return applicationStore.logs.filter((l) => l.habitId === habitId);
  },

  getLogsForDate(date) {
    return applicationStore.logs.filter((l) => l.date === date);
  },

  // --- Settings Actions ---
  updateSettings(updates) {
    applicationStore.settings = { ...applicationStore.settings, ...updates };
    applicationStore.persistLocally();
  },

  // --- Global Reset ---
  async resetStore() {
    applicationStore.habits = [];
    applicationStore.logs = [];
    applicationStore.settings = defaultSettings;
    
    await Promise.all([
      del("app_habits"),
      del("app_logs"),
      del("app_settings")
    ]);
  }
};
