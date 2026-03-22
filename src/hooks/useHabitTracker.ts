import { useCallback, useEffect, useMemo, useState } from 'react';
import { addEntry, createTopic, getEntries, getSettings, getTopics, saveSettings } from '../lib/db';
import { clearGoogleToken, ensureFreshToken, registerBackgroundSync, syncPendingEntries } from '../lib/sync';
import { selectEntrySummaryStats } from '../lib/selectors';
import { roundToQuarter } from '../lib/utils';
import type { AppSettings, HabitEntry, Topic } from '../types';

export type SyncBanner = {
  tone: 'neutral' | 'success' | 'error';
  message: string;
};

const emptySettings: AppSettings = {
  googleClientId: '',
  spreadsheetId: '',
  sheetRange: 'Entries!A:G',
  token: null
};

type SyncSettingsInput = {
  googleClientId: string;
  spreadsheetId: string;
  sheetRange: string;
};

type ManualEntryInput = {
  topicId: string;
  task: string;
  hours: number;
  date: string;
};

type TimerEntryInput = {
  topicId: string;
  task: string;
  date: string;
  elapsedMs: number;
};

type TopicInput = {
  name: string;
  color: string;
};

export function useHabitTracker() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(emptySettings);
  const [syncBanner, setSyncBanner] = useState<SyncBanner>({ tone: 'neutral', message: 'Local-first mode is active.' });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [lastAuthError, setLastAuthError] = useState<string | null>(null);

  const topicMap = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);

  const pendingEntries = useMemo(() => entries.filter((entry) => entry.syncStatus !== 'synced').length, [entries]);

  const stats = useMemo(() => selectEntrySummaryStats(entries), [entries]);

  const authState = useMemo(
    () => ({
      isConnected: settings.token !== null,
      tokenExpiresAt: settings.token?.expiresAt ?? null,
      lastError: lastAuthError
    }),
    [lastAuthError, settings.token]
  );

  const syncSettings = useMemo<SyncSettingsInput>(
    () => ({
      googleClientId: settings.googleClientId,
      spreadsheetId: settings.spreadsheetId,
      sheetRange: settings.sheetRange
    }),
    [settings.googleClientId, settings.sheetRange, settings.spreadsheetId]
  );

  const refreshAll = useCallback(async () => {
    const [nextTopics, nextEntries, nextSettings] = await Promise.all([getTopics(), getEntries(), getSettings()]);
    setTopics(nextTopics);
    setEntries(nextEntries);
    setSettings(nextSettings);
  }, []);

  useEffect(() => {
    void refreshAll().then(() => setIsHydrated(true));
  }, [refreshAll]);

  const attemptSync = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      const result = await syncPendingEntries();
      setSyncBanner({ tone: result.failed > 0 ? 'error' : 'success', message: result.message });
      setLastAuthError(null);
      await refreshAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed unexpectedly.';
      setSyncBanner({
        tone: 'error',
        message
      });
      setLastAuthError(message);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshAll]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncBanner({ tone: 'neutral', message: 'Connection restored. Sync will retry queued entries.' });
      void attemptSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncBanner({ tone: 'neutral', message: 'Offline. New entries stay local until the next successful sync.' });
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'REQUEST_SYNC') {
        void attemptSync();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [attemptSync]);

  const handleManualSubmit = useCallback(
    async (payload: ManualEntryInput) => {
      if (!payload.topicId || !payload.task.trim()) {
        setSyncBanner({ tone: 'error', message: 'Manual entries require a topic and task name.' });
        return;
      }

      await addEntry({
        topicId: payload.topicId,
        task: payload.task.trim(),
        hours: roundToQuarter(payload.hours),
        date: payload.date,
        source: 'manual'
      });
      await refreshAll();
      await registerBackgroundSync();
      if (navigator.onLine && settings.token) {
        void attemptSync();
      }
    },
    [attemptSync, refreshAll, settings.token]
  );

  const handleTimerSubmit = useCallback(
    async (payload: TimerEntryInput) => {
      if (!payload.topicId || !payload.task.trim()) {
        setSyncBanner({ tone: 'error', message: 'Timer entries require a topic and task name.' });
        return;
      }

      const roundedTimerHours = roundToQuarter(payload.elapsedMs / 3_600_000);
      if (roundedTimerHours === 0) {
        setSyncBanner({ tone: 'error', message: 'Run the timer before saving a timed entry.' });
        return;
      }

      await addEntry({
        topicId: payload.topicId,
        task: payload.task.trim(),
        hours: roundedTimerHours,
        date: payload.date,
        source: 'timer'
      });
      await refreshAll();
      await registerBackgroundSync();
      if (navigator.onLine && settings.token) {
        void attemptSync();
      }
    },
    [attemptSync, refreshAll, settings.token]
  );

  const handleTopicSubmit = useCallback(
    async (payload: TopicInput) => {
      if (!payload.name.trim()) {
        return;
      }

      await createTopic(payload.name, payload.color);
      await refreshAll();
    },
    [refreshAll]
  );

  const handleSettingsSubmit = useCallback(
    async (payload: SyncSettingsInput) => {
      const nextSettings: AppSettings = {
        googleClientId: payload.googleClientId.trim(),
        spreadsheetId: payload.spreadsheetId.trim(),
        sheetRange: payload.sheetRange.trim() || 'Entries!A:G',
        token: settings.token
      };
      await saveSettings(nextSettings);
      setSettings(nextSettings);
      setSyncBanner({ tone: 'success', message: 'Sync settings saved locally.' });
    },
    [settings.token]
  );

  const handleGoogleConnect = useCallback(async () => {
    let didConnect = false;

    try {
      setIsSyncing(true);
      await ensureFreshToken(true);
      await refreshAll();
      setSyncBanner({ tone: 'success', message: 'Google account connected on this device.' });
      setLastAuthError(null);
      didConnect = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google authentication failed.';
      setSyncBanner({ tone: 'error', message });
      setLastAuthError(message);
    } finally {
      setIsSyncing(false);
    }

    if (didConnect) {
      await attemptSync();
    }
  }, [attemptSync, refreshAll]);

  const handleDisconnectGoogle = useCallback(async () => {
    await clearGoogleToken();
    await refreshAll();
    setLastAuthError(null);
    setSyncBanner({ tone: 'neutral', message: 'Stored Google token removed from this device.' });
  }, [refreshAll]);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    setInstallPrompt(null);
  }, [installPrompt]);

  return {
    topics,
    entries,
    syncSettings,
    authState,
    syncBanner,
    isHydrated,
    isSyncing,
    isOnline,
    installPrompt,
    topicMap,
    pendingEntries,
    stats,
    attemptSync,
    handleManualSubmit,
    handleTimerSubmit,
    handleTopicSubmit,
    handleSettingsSubmit,
    handleGoogleConnect,
    handleDisconnectGoogle,
    handleInstall
  };
}
