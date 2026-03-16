import { openDB } from 'idb';
import type { AppSettings, HabitEntry, QueueItem, Topic } from '../types';
import { DEFAULT_TOPIC_PALETTE, DEFAULT_TOPICS, createId } from './utils';

const DB_NAME = 'habit-tracker-db';
const SETTINGS_KEY = 'app-settings';

type HabitTrackerDb = {
  topics: {
    key: string;
    value: Topic;
  };
  entries: {
    key: string;
    value: HabitEntry;
    indexes: { 'by-date': string; 'by-sync-status': string };
  };
  queue: {
    key: string;
    value: QueueItem;
    indexes: { 'by-entry-id': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
};

const defaultSettings: AppSettings = {
  googleClientId: '',
  spreadsheetId: '',
  sheetRange: 'Entries!A:G',
  token: null
};

const dbPromise = openDB<HabitTrackerDb>(DB_NAME, 1, {
  upgrade(db) {
    const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
    const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
    entryStore.createIndex('by-date', 'date');
    entryStore.createIndex('by-sync-status', 'syncStatus');
    const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
    queueStore.createIndex('by-entry-id', 'entryId', { unique: true });
    db.createObjectStore('settings');

    DEFAULT_TOPICS.forEach((name, index) => {
      topicStore.add({
        id: createId('topic'),
        name,
        color: DEFAULT_TOPIC_PALETTE[index % DEFAULT_TOPIC_PALETTE.length],
        createdAt: new Date().toISOString()
      });
    });
  }
});

export async function getTopics() {
  const db = await dbPromise;
  const items = await db.getAll('topics');
  return items.sort((left, right) => left.name.localeCompare(right.name));
}

export async function createTopic(name: string, color: string) {
  const topic: Topic = {
    id: createId('topic'),
    name: name.trim(),
    color,
    createdAt: new Date().toISOString()
  };

  const db = await dbPromise;
  await db.put('topics', topic);
  return topic;
}

export async function getEntries() {
  const db = await dbPromise;
  const items = await db.getAll('entries');
  return items.sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt));
}

export async function addEntry(entry: Omit<HabitEntry, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) {
  const db = await dbPromise;
  const now = new Date().toISOString();
  const record: HabitEntry = {
    ...entry,
    id: createId('entry'),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending'
  };
  const queueItem: QueueItem = {
    id: createId('queue'),
    entryId: record.id,
    createdAt: now,
    attempts: 0
  };

  const tx = db.transaction(['entries', 'queue'], 'readwrite');
  await tx.objectStore('entries').put(record);
  await tx.objectStore('queue').put(queueItem);
  await tx.done;
  return record;
}

export async function getPendingQueue() {
  const db = await dbPromise;
  const items = await db.getAll('queue');
  return items.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function getEntry(entryId: string) {
  const db = await dbPromise;
  return db.get('entries', entryId);
}

export async function getTopic(topicId: string) {
  const db = await dbPromise;
  return db.get('topics', topicId);
}

export async function markEntrySynced(entryId: string) {
  const db = await dbPromise;
  const entry = await db.get('entries', entryId);
  if (!entry) {
    return;
  }

  await db.put('entries', {
    ...entry,
    syncStatus: 'synced',
    updatedAt: new Date().toISOString()
  });
}

export async function markQueueFailed(queueId: string, message: string) {
  const db = await dbPromise;
  const queueItem = await db.get('queue', queueId);
  if (!queueItem) {
    return;
  }

  await db.put('queue', {
    ...queueItem,
    attempts: queueItem.attempts + 1,
    lastError: message
  });
}

export async function removeQueueItem(queueId: string) {
  const db = await dbPromise;
  await db.delete('queue', queueId);
}

export async function getSettings() {
  const db = await dbPromise;
  return (await db.get('settings', SETTINGS_KEY)) ?? defaultSettings;
}

export async function saveSettings(settings: AppSettings) {
  const db = await dbPromise;
  await db.put('settings', settings, SETTINGS_KEY);
  return settings;
}