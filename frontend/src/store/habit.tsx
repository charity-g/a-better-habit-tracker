import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {type Habit, type HabitLog} from '../model/habit'
import {type AppSettings, defaultSettings} from '../model/settings'
import {SyncStatus} from '../model/syncStatus'

/* =========================
   Store State
========================= */

type HabitStore = {
  habits: Habit[];
  logs: HabitLog[];
  settings: AppSettings;

  /* Habit Actions */
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  /* Log Actions */
  addLog: (log: HabitLog) => void;
  updateLog: (id: string, updates: Partial<HabitLog>) => void;
  deleteLog: (id: string) => void;

  /* Query Helpers */
  getLogsForHabit: (habitId: string) => HabitLog[];
  getLogsForDate: (date: string) => HabitLog[];

  /* Sync Helpers */
  markLogSynced: (id: string) => void;
  markLogError: (id: string) => void;

  /* Settings */
  updateSettings: (updates: Partial<AppSettings>) => void;

  /* Utilities */
  resetStore: () => void;
};


/* =========================
   Store
========================= */

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      settings: defaultSettings,

      /* =====================
         Habit Actions
      ===================== */

      addHabit: (habit) =>
        set((state) => ({
          habits: [...state.habits, habit],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  ...updates,
                }
              : habit
          ),
        })),

      archiveHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  archived: true,
                }
              : habit
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
          logs: state.logs.filter((log) => log.habitId !== id),
        })),

      /* =====================
         Log Actions
      ===================== */

      addLog: (log) =>
        set((state) => ({
          logs: [...state.logs, log],
        })),

      updateLog: (id, updates) =>
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id
              ? {
                  ...log,
                  ...updates,
                }
              : log
          ),
        })),

      deleteLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        })),

      /* =====================
         Query Helpers
      ===================== */

      getLogsForHabit: (habitId) => {
        return get().logs.filter((log) => log.habitId === habitId);
      },

      getLogsForDate: (date) => {
        return get().logs.filter((log) => log.date === date);
      },

      /* =====================
         Sync Helpers
      ===================== */

      markLogSynced: (id) =>
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id
              ? {
                  ...log,
                  syncStatus: SyncStatus.Synced,
                  syncedAt: new Date().toISOString(),
                }
              : log
          ),
        })),

      markLogError: (id) =>
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id
              ? {
                  ...log,
                  syncStatus: SyncStatus.Error,
                }
              : log
          ),
        })),

      /* =====================
         Settings
      ===================== */

      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        })),

      /* =====================
         Utilities
      ===================== */

      resetStore: () =>
        set({
          habits: [],
          logs: [],
          settings: defaultSettings,
        }),
    }),
    {
      name: 'habit-tracker-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);