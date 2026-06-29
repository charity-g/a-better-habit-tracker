import { signal } from "@preact/signals";
import { get, set, del } from "idb-keyval";
import { type Habit, type HabitLog } from "../habit/habitModel";
import { type AppSettings, defaultSettings } from "../model/settings";
import { SyncStatus } from '../model/syncStatus';

const API_BASE_URL = "https://api.yourdomain.com/v1";

// --- Internal Preact Signals ---
const habitsSignal = signal<Habit[]>([]);
const logsSignal = signal<HabitLog[]>([]);
const settingsSignal = signal<AppSettings>(defaultSettings);
const isOnlineSignal = signal<boolean>(
  typeof navigator !== "undefined" ? navigator.onLine : true,
);

// --- The applicationStore Persistence Core ---
export const applicationStore = {
  // Read accessors for signals
  get habits() {
    return habitsSignal.value;
  },
  set habits(val) {
    habitsSignal.value = val;
  },

  get logs() {
    return logsSignal.value;
  },
  set logs(val) {
    logsSignal.value = val;
  },

  get settings() {
    return settingsSignal.value;
  },
  set settings(val) {
    settingsSignal.value = val;
  },

  markLogSynced(logId: string) {
    logsSignal.value = logsSignal.value.map((log) =>
      log.id === logId
        ? { ...log, syncStatus: SyncStatus.Synced }
        : log
    );
    this.persistLocally();
  },

  markLogError(logId: string) {
    logsSignal.value = logsSignal.value.map((log) =>
      log.id === logId
        ? { ...log, syncStatus: SyncStatus.Error }
        : log
    );
    this.persistLocally();
  },

  /**
   * Internal database synchronization engine
   */
  async persistLocally() {
    await Promise.all([
      set("app_habits", habitsSignal.value),
      set("app_logs", logsSignal.value),
      set("app_settings", settingsSignal.value),
    ]);
  },

  /**
   * Dispatches unsynced log additions to the remote REST layer
   */
  async syncPendingLogsWithAPI() {
    if (!isOnlineSignal.value) return;

    // FIX: Updated string comparison to match SyncStatus Enum structure
    const pendingLogs = logsSignal.value.filter(
      (log) => log.syncStatus === SyncStatus.Pending,
    );
    if (pendingLogs.length === 0) return;

    for (const log of pendingLogs) {
      try {
        const response = await fetch(`${API_BASE_URL}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(log),
        });

        if (response.ok) {
          this.markLogSynced(log.id);
        } else {
          this.markLogError(log.id);
        }
      } catch (error) {
        console.error(`Failed synchronization for item: ${log.id}`, error);
        this.markLogError(log.id);
        break; // FIX: The loop now only halts when a fetch error throws!
      }
    }
  },

  /**
   * Boots the engine up, loads IndexedDB indexes, and connects internet monitors
   */
  async initialize() {
    const [cachedHabits, cachedLogs, cachedSettings] = await Promise.all([
      get<Habit[]>("app_habits"),
      get<HabitLog[]>("app_logs"),
      get<AppSettings>("app_settings"),
    ]);

    habitsSignal.value = cachedHabits ?? [];
    logsSignal.value = cachedLogs ?? [];
    settingsSignal.value = cachedSettings ?? defaultSettings;

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        isOnlineSignal.value = true;
        this.syncPendingLogsWithAPI();
      });

      window.addEventListener("offline", () => {
        isOnlineSignal.value = false;
      });
    }

    if (isOnlineSignal.value) {
      this.syncPendingLogsWithAPI();
    }
  },
};