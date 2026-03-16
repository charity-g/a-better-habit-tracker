export type EntrySource = 'manual' | 'timer';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface Topic {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface HabitEntry {
  id: string;
  topicId: string;
  task: string;
  hours: number;
  date: string;
  source: EntrySource;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface QueueItem {
  id: string;
  entryId: string;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export interface GoogleAuthToken {
  accessToken: string;
  expiresAt: number;
}

export interface AppSettings {
  googleClientId: string;
  spreadsheetId: string;
  sheetRange: string;
  token: GoogleAuthToken | null;
}

export interface ManualEntryDraft {
  topicId: string;
  task: string;
  hours: number;
  date: string;
}

export interface TimerDraft {
  topicId: string;
  task: string;
  date: string;
}