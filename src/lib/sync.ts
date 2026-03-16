import { appendRowToSheet, requestGoogleToken } from './google';
import {
  getEntry,
  getPendingQueue,
  getSettings,
  getTopic,
  markEntrySynced,
  markQueueFailed,
  removeQueueItem,
  saveSettings
} from './db';

type SyncCapableServiceWorkerRegistration = ServiceWorkerRegistration & {
  sync: {
    register: (tag: string) => Promise<void>;
  };
};

export async function ensureFreshToken(forcePrompt = false) {
  const settings = await getSettings();
  if (!settings.googleClientId.trim()) {
    throw new Error('Google client ID is missing.');
  }

  if (!forcePrompt && settings.token && settings.token.expiresAt > Date.now() + 60_000) {
    return settings;
  }

  const token = await requestGoogleToken(settings.googleClientId, forcePrompt ? 'consent' : '');
  const nextSettings = { ...settings, token };
  await saveSettings(nextSettings);
  return nextSettings;
}

export async function syncPendingEntries() {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0, message: 'Offline. Pending entries remain queued locally.' };
  }

  const queue = await getPendingQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, message: 'Everything is already synced.' };
  }

  const settings = await ensureFreshToken(false);
  let synced = 0;
  let failed = 0;

  for (const queueItem of queue) {
    const entry = await getEntry(queueItem.entryId);
    const topic = entry ? await getTopic(entry.topicId) : undefined;

    if (!entry || !topic) {
      await removeQueueItem(queueItem.id);
      continue;
    }

    try {
      await appendRowToSheet(settings, [
        entry.date,
        topic.name,
        entry.task,
        entry.hours,
        entry.source,
        entry.createdAt,
        entry.id
      ]);
      await markEntrySynced(entry.id);
      await removeQueueItem(queueItem.id);
      synced += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown sync failure.';
      await markQueueFailed(queueItem.id, message);
      if (message.includes('401') || message.includes('403') || message.toLowerCase().includes('invalid credentials')) {
        throw new Error('Google authorization expired. Reconnect and retry sync.');
      }
    }
  }

  return {
    synced,
    failed,
    message: failed > 0 ? 'Some entries could not be synced. They remain in the local queue.' : 'Pending entries synced to Google Sheets.'
  };
}

export async function clearGoogleToken() {
  const settings = await getSettings();
  await saveSettings({ ...settings, token: null });
}

export async function registerBackgroundSync() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if ('sync' in registration) {
    await (registration as SyncCapableServiceWorkerRegistration).sync.register('habit-sync');
    return;
  }

  const controller = navigator.serviceWorker.controller;
  controller?.postMessage({ type: 'QUEUE_SYNC' });
}