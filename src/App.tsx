import { FormEvent, useEffect, useMemo, useState } from 'react';
import { addEntry, createTopic, getEntries, getSettings, getTopics, saveSettings } from './lib/db';
import { clearGoogleToken, ensureFreshToken, registerBackgroundSync, syncPendingEntries } from './lib/sync';
import { DEFAULT_TOPIC_PALETTE, formatDuration, formatHours, roundToQuarter, startOfWeek, todayLocal } from './lib/utils';
import type { AppSettings, HabitEntry, ManualEntryDraft, TimerDraft, Topic } from './types';

type SyncBanner = {
  tone: 'neutral' | 'success' | 'error';
  message: string;
};

const emptySettings: AppSettings = {
  googleClientId: '',
  spreadsheetId: '',
  sheetRange: 'Entries!A:G',
  token: null
};

function App() {
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

  async function refreshAll() {
    const [nextTopics, nextEntries, nextSettings] = await Promise.all([getTopics(), getEntries(), getSettings()]);
    setTopics(nextTopics);
    setEntries(nextEntries);
    setSettings(nextSettings);

    const fallbackTopicId = nextTopics[0]?.id ?? '';
    setManualDraft((current) => ({ ...current, topicId: current.topicId || fallbackTopicId }));
    setTimerDraft((current) => ({ ...current, topicId: current.topicId || fallbackTopicId }));
  }

  useEffect(() => {
    void refreshAll().then(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!timerStartedAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - timerStartedAt);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerStartedAt]);

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
  }, [entries.length]);

  async function attemptSync() {
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
  }

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
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
  }

  async function handleTimerSubmit(event: FormEvent<HTMLFormElement>) {
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
  }

  async function handleTopicSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topicName.trim()) {
      return;
    }

    await createTopic(topicName, topicColor);
    setTopicName('');
    setTopicColor(DEFAULT_TOPIC_PALETTE[(DEFAULT_TOPIC_PALETTE.indexOf(topicColor) + 1) % DEFAULT_TOPIC_PALETTE.length]);
    await refreshAll();
  }

  async function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
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
  }

  async function handleGoogleConnect() {
    try {
      setIsSyncing(true);
      await ensureFreshToken(true);
      await refreshAll();
      setSyncBanner({ tone: 'success', message: 'Google account connected on this device.' });
      await attemptSync();
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDisconnectGoogle() {
    await clearGoogleToken();
    await refreshAll();
    setSyncBanner({ tone: 'neutral', message: 'Stored Google token removed from this device.' });
  }

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  if (!isHydrated) {
    return <main className="app-shell loading-shell">Loading tracker...</main>;
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Single-screen personal tracker</p>
          <h1>A Better Habit Tracker</h1>
          <p className="hero-copy">
            Track work sessions, add manual logs, queue everything offline, and sync to your Google Sheet whenever the connection is available again.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={() => void attemptSync()} disabled={isSyncing}>
            {isSyncing ? 'Syncing...' : 'Sync pending rows'}
          </button>
          {installPrompt ? (
            <button className="secondary-button" type="button" onClick={() => void handleInstall()}>
              Install app
            </button>
          ) : null}
        </div>
      </section>

      <section className="status-strip">
        <div className="status-item">
          <span>Status</span>
          <strong>{isOnline ? 'Online' : 'Offline'}</strong>
        </div>
        <div className="status-item">
          <span>Queued</span>
          <strong>{pendingEntries}</strong>
        </div>
        <div className="status-item">
          <span>Today</span>
          <strong>{formatHours(stats.today)}</strong>
        </div>
        <div className="status-item">
          <span>This week</span>
          <strong>{formatHours(stats.week)}</strong>
        </div>
        <div className="status-item">
          <span>Topics</span>
          <strong>{topics.length}</strong>
        </div>
      </section>

      <section className={`sync-banner ${syncBanner.tone}`}>{syncBanner.message}</section>

      <section className="content-grid">
        <article className="panel panel-large">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Manual entry</p>
              <h2>Log a finished block</h2>
            </div>
          </header>
          <form className="form-grid" onSubmit={handleManualSubmit}>
            <label>
              Topic
              <select value={manualDraft.topicId} onChange={(event) => setManualDraft((current) => ({ ...current, topicId: event.target.value }))}>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide-field">
              Task
              <input value={manualDraft.task} onChange={(event) => setManualDraft((current) => ({ ...current, task: event.target.value }))} placeholder="What did you work on?" />
            </label>
            <label>
              Hours
              <input type="number" min="0.25" step="0.25" value={manualDraft.hours} onChange={(event) => setManualDraft((current) => ({ ...current, hours: Number(event.target.value) }))} />
            </label>
            <label>
              Date
              <input type="date" value={manualDraft.date} onChange={(event) => setManualDraft((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <button className="primary-button wide-field" type="submit">
              Save manual entry
            </button>
          </form>
        </article>

        <article className="panel panel-large accent-panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Timer capture</p>
              <h2>Run a live session</h2>
            </div>
            <div className="timer-clock">{formatDuration(elapsedMs)}</div>
          </header>
          <form className="form-grid" onSubmit={handleTimerSubmit}>
            <label>
              Topic
              <select value={timerDraft.topicId} onChange={(event) => setTimerDraft((current) => ({ ...current, topicId: event.target.value }))}>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide-field">
              Task
              <input value={timerDraft.task} onChange={(event) => setTimerDraft((current) => ({ ...current, task: event.target.value }))} placeholder="Current focus" />
            </label>
            <label>
              Date
              <input type="date" value={timerDraft.date} onChange={(event) => setTimerDraft((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <div className="timer-actions wide-field">
              <button className="secondary-button" type="button" onClick={() => { setTimerStartedAt(Date.now() - elapsedMs); }} disabled={timerStartedAt !== null}>
                Start
              </button>
              <button className="secondary-button" type="button" onClick={() => setTimerStartedAt(null)} disabled={timerStartedAt === null}>
                Pause
              </button>
              <button className="secondary-button" type="button" onClick={() => { setTimerStartedAt(null); setElapsedMs(0); }}>
                Reset
              </button>
              <button className="primary-button" type="submit">
                Save {roundedTimerHours > 0 ? `(${formatHours(roundedTimerHours)})` : ''}
              </button>
            </div>
          </form>
        </article>

        <article className="panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Topic config</p>
              <h2>Manage categories</h2>
            </div>
          </header>
          <form className="topic-form" onSubmit={handleTopicSubmit}>
            <input value={topicName} onChange={(event) => setTopicName(event.target.value)} placeholder="Add a topic" />
            <div className="swatch-row">
              {DEFAULT_TOPIC_PALETTE.map((color) => (
                <button
                  key={color}
                  className={`swatch ${topicColor === color ? 'selected' : ''}`}
                  type="button"
                  style={{ backgroundColor: color }}
                  onClick={() => setTopicColor(color)}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
            <button className="secondary-button" type="submit">
              Add topic
            </button>
          </form>
          <ul className="topic-list">
            {topics.map((topic) => (
              <li key={topic.id}>
                <span className="topic-chip" style={{ backgroundColor: topic.color }} />
                <span>{topic.name}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Google Sheets sync</p>
              <h2>Configure your private sheet</h2>
            </div>
          </header>
          <form className="form-grid" onSubmit={handleSettingsSubmit}>
            <label className="wide-field">
              Google OAuth Client ID
              <input name="googleClientId" defaultValue={settings.googleClientId} placeholder="1234567890-abc.apps.googleusercontent.com" />
            </label>
            <label className="wide-field">
              Spreadsheet ID
              <input name="spreadsheetId" defaultValue={settings.spreadsheetId} placeholder="Google Sheet ID from the URL" />
            </label>
            <label className="wide-field">
              Range
              <input name="sheetRange" defaultValue={settings.sheetRange} placeholder="Entries!A:G" />
            </label>
            <button className="secondary-button" type="submit">
              Save sync settings
            </button>
          </form>
          <div className="settings-actions">
            <button className="primary-button" type="button" onClick={() => void handleGoogleConnect()} disabled={isSyncing}>
              {settings.token ? 'Refresh Google token' : 'Connect Google account'}
            </button>
            <button className="ghost-button" type="button" onClick={() => void handleDisconnectGoogle()} disabled={!settings.token}>
              Disconnect token
            </button>
          </div>
          <p className="small-note">
            Rows are appended as: date, topic, task, hours, source, createdAt, entryId. Keep your sheet private and add a header row in the same order.
          </p>
        </article>

        <article className="panel panel-wide">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Recent entries</p>
              <h2>Local timeline</h2>
            </div>
          </header>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Topic</th>
                  <th>Task</th>
                  <th>Hours</th>
                  <th>Source</th>
                  <th>Sync</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      No entries yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{topicMap.get(entry.topicId)?.name ?? 'Unknown topic'}</td>
                      <td>{entry.task}</td>
                      <td>{formatHours(entry.hours)}</td>
                      <td>{entry.source}</td>
                      <td>
                        <span className={`sync-pill ${entry.syncStatus}`}>{entry.syncStatus}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;