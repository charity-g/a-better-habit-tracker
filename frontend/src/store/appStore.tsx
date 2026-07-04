// appStore.tsx
import { signal } from "@preact/signals";
import { get, set, del } from "idb-keyval";
import { type Habit, type HabitLog } from "../habit/habitModel";
import { type AppSettings, defaultSettings } from "../model/settings";
import { SyncStatus } from "../model/syncStatus";
import {
  googleAuthSignal,
  signIn as googleSignIn,
  signOut as googleSignOut,
  getValidAccessToken,
  pickExistingSheet,
} from "../auth/googleAuth";
import { ensureSheetTabExists, appendRows, SheetsApiError } from "../auth/sheetsClient";

// --- Internal Preact Signals ---
const habitsSignal = signal<Habit[]>([]);
const logsSignal = signal<HabitLog[]>([]);
const settingsSignal = signal<AppSettings>(defaultSettings);
const isOnlineSignal = signal<boolean>(
  typeof navigator !== "undefined" ? navigator.onLine : true,
);

// Which spreadsheet (if any) is the user's chosen sync target. Persisted
// locally so we don't need to re-pick on every visit — but this is just an
// ID, not a credential, so it's safe to keep in IndexedDB.
const linkedSpreadsheetIdSignal = signal<string | null>(null);
const linkedSpreadsheetNameSignal = signal<string | null>(null);

const TAB_NAME = "HabitLogs";

// Order matters here and must match appendRows() call sites below.
function logToRow(log: HabitLog): unknown[] {
  return [log.id, log.habitId, log.date, log.syncStatus, log.note ?? ""];
}

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

  // --- Google account / sheet linking state (read-only views for UI) ---

  get googleAuth() {
    return googleAuthSignal.value;
  },

  get linkedSpreadsheetId() {
    return linkedSpreadsheetIdSignal.value;
  },

  get linkedSpreadsheetName() {
    return linkedSpreadsheetNameSignal.value;
  },

  get isSyncEnabled() {
    return googleAuthSignal.value.status === "signed-in" && linkedSpreadsheetIdSignal.value !== null;
  },

  /**
   * Opt-in entry point for "sync to my Google account". Two steps in one
   * call: sign in (if needed), then let the user pick a spreadsheet via
   * Google Picker. Safe to call again later to switch which sheet is linked.
   *
   * This never runs automatically — it's only invoked from an explicit
   * button click in the UI, since both signIn() and the Picker require a
   * user gesture to reliably show their popups.
   */
  async connectGoogleSheet(): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      if (googleAuthSignal.value.status !== "signed-in") {
        await googleSignIn(); // Modifies googleAuthSignal
      }

      const state = googleAuthSignal.value;

      if (state.status !== "signed-in") {
        return {
          ok: false,
          error:
            state.status === "error"
              ? state.message
              : "Sign-in was cancelled.",
        };
      }

      const picked = await pickExistingSheet();
      if (!picked) {
        return { ok: false, error: "No sheet selected." };
      }
      if (picked.mimeType && picked.mimeType !== "application/vnd.google-apps.spreadsheet") {
        return {
          ok: false,
          error: "Please pick a Google Sheets file (not Excel/CSV).",
        };
      }

      const token = await getValidAccessToken();
      if (!token) {
        return { ok: false, error: "Lost Google session — please try again." };
      }

      await ensureSheetTabExists(picked.id, token, TAB_NAME);

      linkedSpreadsheetIdSignal.value = picked.id;
      linkedSpreadsheetNameSignal.value = picked.name;
      await set("app_linked_spreadsheet", { id: picked.id, name: picked.name });

      // Now that we have somewhere to write, push anything already pending.
      this.syncPendingLogsWithSheets();

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to connect Google Sheet.",
      };
    }
  },

  /**
   * Disconnects sync without deleting any local data. The app continues to
   * work fully offline; logs simply accumulate as Pending until reconnected.
   */
  disconnectGoogleSheet(): void {
    googleSignOut();
    linkedSpreadsheetIdSignal.value = null;
    linkedSpreadsheetNameSignal.value = null;
    del("app_linked_spreadsheet");
  },

  markLogSynced(logId: string) {
    logsSignal.value = logsSignal.value.map((log) =>
      log.id === logId ? { ...log, syncStatus: SyncStatus.Synced } : log,
    );
    this.persistLocally();
  },

  markLogError(logId: string) {
    logsSignal.value = logsSignal.value.map((log) =>
      log.id === logId ? { ...log, syncStatus: SyncStatus.Error } : log,
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
   * Dispatches unsynced log additions to the user's linked Google Sheet.
   * No-op if the user hasn't opted into sync (no auth, or no sheet linked) —
   * in that case logs simply stay Pending in IndexedDB until they do, which
   * is the correct offline-first behavior.
   */
  async syncPendingLogsWithSheets() {
    if (!isOnlineSignal.value) return;
    if (!this.isSyncEnabled) return;

    const pendingLogs = logsSignal.value.filter((log) => log.syncStatus === SyncStatus.Pending);
    if (pendingLogs.length === 0) return;

    const token = await getValidAccessToken();
    if (!token) {
      // Silent refresh failed — user will need to reconnect. Leave logs as
      // Pending (not Error) since this isn't a data problem, just an
      // expired/revoked session; they'll flush automatically once
      // reconnected.
      return;
    }

    const spreadsheetId = linkedSpreadsheetIdSignal.value!;

    // Batch into a single append call rather than one request per log —
    // friendlier to Sheets API rate limits and much faster for a backlog
    // built up while offline.
    try {
      await appendRows(
        spreadsheetId,
        token,
        TAB_NAME,
        pendingLogs.map(logToRow),
      );
      for (const log of pendingLogs) {
        this.markLogSynced(log.id);
      }
    } catch (error) {
      console.error("Failed to sync logs to Google Sheets", error);
      if (error instanceof SheetsApiError && error.isAuthError) {
        // Token was rejected outright (revoked access, file unshared, etc).
        // Don't mark individual logs as Error — this is a session problem,
        // not a data problem. Drop the link so the UI can prompt reconnect.
        linkedSpreadsheetIdSignal.value = null;
        linkedSpreadsheetNameSignal.value = null;
        del("app_linked_spreadsheet");
      } else {
        for (const log of pendingLogs) {
          this.markLogError(log.id);
        }
      }
    }
  },

  /**
   * Boots the engine up, loads IndexedDB indexes, and connects internet monitors
   */
  async initialize() {
    const [cachedHabits, cachedLogs, cachedSettings, cachedSpreadsheet] = await Promise.all([
      get<Habit[]>("app_habits"),
      get<HabitLog[]>("app_logs"),
      get<AppSettings>("app_settings"),
      get<{ id: string; name: string }>("app_linked_spreadsheet"),
    ]);

    habitsSignal.value = cachedHabits ?? [];
    logsSignal.value = cachedLogs ?? [];
    settingsSignal.value = cachedSettings ?? defaultSettings;

    if (cachedSpreadsheet) {
      linkedSpreadsheetIdSignal.value = cachedSpreadsheet.id;
      linkedSpreadsheetNameSignal.value = cachedSpreadsheet.name;
    }

    // Note: we deliberately do NOT attempt to silently re-authenticate with
    // Google on boot. GIS access tokens aren't persisted (by design — see
    // googleAuth.ts), so after a reload the user is "signed out" of Google
    // even though their spreadsheet link is remembered. The UI should show
    // a "Reconnect to resume syncing" affordance rather than this module
    // popping a consent screen unprompted on every page load.

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        isOnlineSignal.value = true;
        this.syncPendingLogsWithSheets();
      });

      window.addEventListener("offline", () => {
        isOnlineSignal.value = false;
      });
    }

    if (isOnlineSignal.value) {
      this.syncPendingLogsWithSheets();
    }
  },
};