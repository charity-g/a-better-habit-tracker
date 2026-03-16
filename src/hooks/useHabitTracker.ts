import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { addEntry, createTopic, getEntries, getSettings, getTopics, saveSettings } from '../lib/db';
import { clearGoogleToken, ensureFreshToken, registerBackgroundSync, syncPendingEntries } from '../lib/sync';
import { DEFAULT_TOPIC_PALETTE, roundToQuarter, startOfWeek, todayLocal } from '../lib/utils';
import type { AppSettings, HabitEntry, ManualEntryDraft, TimerDraft, Topic } from '../types';

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

export function useHabitTracker() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(emptySettings);
  const [manualDraft, setManualDraft] = useState<ManualEntryDraft>({ topicId: '', task: '', hours: 0.5, date: todayLocal() });
  const [timerDraft, setTimerDraft] = useState<TimerDraft>({ topicId: '', task: '', date: todayLocal() });
  const [topicName, setTopicName] = useState('');
  const [topicColor, setTopicColor] = useState(DEFAULT_TOPIC_PALETTE[0]);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [syncBanner, setSyncBanner] = useState<SyncBanner>({ tone: 'neutral', message: 'Local-first mode is active.' });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const topicMap = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);

  const pendingEntries = useMemo(() => entries.filter((entry) => entry.syncStatus !== 'synced').length, [entries]);

  const stats = useMemo(() => {
    const today = todayLocal();
    const weekStart = startOfWeek(new Date());
    return entries.reduce(
      (accumulator, entry) => {
        if (entry.date === today) {
          accumulator.today += entry.hours;
        }

        if (new Date(entry.date) >= weekStart) {
          accumulator.week += entry.hours;
        }

        return accumulator;
      },
      { today: 0, week: 0 }
    );
  }, [entries]);

  const roundedTimerHours = useMemo(() => roundToQuarter(elapsedMs / 3_600_000), [elapsedMs]);

  const refreshAll = useCallback(async () => {
    const [nextTopics, nextEntries, nextSettings] = await Promise.all([getTopics(), getEntries(), getSettings()]);
    setTopics(nextTopics);
    setEntries(nextEntries);
    setSettings(nextSettings);

    const fallbackTopicId = nextTopics[0]?.id ?? '';
    setManualDraft((current) => ({ ...current, topicId: current.topicId || fallbackTopicId }));
    setTimerDraft((current) => ({ ...current, topicId: current.topicId || fallbackTopicId }));
  }, []);

  useEffect(() => {
    void refreshAll().then(() => setIsHydrated(true));
  }, [refreshAll]);

  useEffect(() => {
    if (!timerStartedAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - timerStartedAt);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerStartedAt]);

  const attemptSync = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      const result = await syncPendingEntries();
      setSyncBanner({ tone: result.failed > 0 ? 'error' : 'success', message: result.message });
      await refreshAll();
    } catch (error) {
      setSyncBanner({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Sync failed unexpectedly.'
      });
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

  const updateManualDraft = useCallback((patch: Partial<ManualEntryDraft>) => {
    setManualDraft((current) => ({ ...current, ...patch }));
  }, []);

  const updateTimerDraft = useCallback((patch: Partial<TimerDraft>) => {
    setTimerDraft((current) => ({ ...current, ...patch }));
  }, []);

  const handleManualSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!manualDraft.topicId || !manualDraft.task.trim()) {
        setSyncBanner({ tone: 'error', message: 'Manual entries require a topic and task name.' });
        return;
      }

      await addEntry({
        topicId: manualDraft.topicId,
        task: manualDraft.task.trim(),
        hours: roundToQuarter(manualDraft.hours),
        date: manualDraft.date,
        source: 'manual'
      });
      setManualDraft((current) => ({ ...current, task: '', hours: 0.5 }));
      await refreshAll();
      await registerBackgroundSync();
      if (navigator.onLine && settings.token) {
        void attemptSync();
      }
    },
    [attemptSync, manualDraft, refreshAll, settings.token]
  );

  const handleTimerSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!timerDraft.topicId || !timerDraft.task.trim()) {
        setSyncBanner({ tone: 'error', message: 'Timer entries require a topic and task name.' });
        return;
      }

      if (roundedTimerHours === 0) {
        setSyncBanner({ tone: 'error', message: 'Run the timer before saving a timed entry.' });
        return;
      }

      await addEntry({
        topicId: timerDraft.topicId,
        task: timerDraft.task.trim(),
        hours: roundedTimerHours,
        date: timerDraft.date,
        source: 'timer'
      });
      setTimerDraft((current) => ({ ...current, task: '' }));
      setTimerStartedAt(null);
      setElapsedMs(0);
      await refreshAll();
      await registerBackgroundSync();
      if (navigator.onLine && settings.token) {
        void attemptSync();
      }
    },
    [attemptSync, refreshAll, roundedTimerHours, settings.token, timerDraft]
  );

  const handleTopicSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!topicName.trim()) {
        return;
      }

      await createTopic(topicName, topicColor);
      setTopicName('');
      setTopicColor(DEFAULT_TOPIC_PALETTE[(DEFAULT_TOPIC_PALETTE.indexOf(topicColor) + 1) % DEFAULT_TOPIC_PALETTE.length]);
      await refreshAll();
    },
    [topicColor, topicName, refreshAll]
  );

  const handleSettingsSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const nextSettings: AppSettings = {
        googleClientId: String(formData.get('googleClientId') ?? '').trim(),
        spreadsheetId: String(formData.get('spreadsheetId') ?? '').trim(),
        sheetRange: String(formData.get('sheetRange') ?? 'Entries!A:G').trim() || 'Entries!A:G',
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
      didConnect = true;
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
    setSyncBanner({ tone: 'neutral', message: 'Stored Google token removed from this device.' });
  }, [refreshAll]);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    setInstallPrompt(null);
  }, [installPrompt]);

  const startTimer = useCallback(() => {
    setTimerStartedAt(Date.now() - elapsedMs);
  }, [elapsedMs]);

  const pauseTimer = useCallback(() => {
    setTimerStartedAt(null);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerStartedAt(null);
    setElapsedMs(0);
  }, []);

  return {
    topics,
    entries,
    settings,
    manualDraft,
    timerDraft,
    topicName,
    topicColor,
    timerStartedAt,
    elapsedMs,
    syncBanner,
    isHydrated,
    isSyncing,
    isOnline,
    installPrompt,
    topicMap,
    pendingEntries,
    stats,
    roundedTimerHours,
    updateManualDraft,
    updateTimerDraft,
    setTopicName,
    setTopicColor,
    attemptSync,
    handleManualSubmit,
    handleTimerSubmit,
    handleTopicSubmit,
    handleSettingsSubmit,
    handleGoogleConnect,
    handleDisconnectGoogle,
    handleInstall,
    startTimer,
    pauseTimer,
    resetTimer
  };
}
