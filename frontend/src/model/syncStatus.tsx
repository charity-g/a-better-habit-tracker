export const SyncStatus = {
  Pending: 'pending',
  Synced: 'synced',
  Error: 'error',
} as const;

export type SyncStatus =
  (typeof SyncStatus)[keyof typeof SyncStatus];