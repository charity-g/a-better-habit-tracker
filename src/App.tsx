import { EntriesSection } from './components/EntriesSection';
import { HeroSection } from './components/HeroSection';
import { ManualEntrySection } from './components/ManualEntrySection';
import { StatusStrip } from './components/StatusStrip';
import { SyncBannerSection } from './components/SyncBannerSection';
import { SyncSettingsSection } from './components/SyncSettingsSection';
import { TimerEntrySection } from './components/TimerEntrySection';
import { TopicSection } from './components/TopicSection';
import { useHabitTracker } from './hooks/useHabitTracker';

function App() {
  const {
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
  } = useHabitTracker();

  if (!isHydrated) {
    return <main className="app-shell loading-shell">Loading tracker...</main>;
  }

  return (
    <main className="app-shell">
      <HeroSection isSyncing={isSyncing} canInstall={installPrompt !== null} onSync={() => void attemptSync()} onInstall={() => void handleInstall()} />

      <StatusStrip isOnline={isOnline} pendingEntries={pendingEntries} todayHours={stats.today} weekHours={stats.week} topicCount={topics.length} />

      <SyncBannerSection banner={syncBanner} />

      <section className="content-grid">
        <ManualEntrySection topics={topics} draft={manualDraft} onChange={updateManualDraft} onSubmit={handleManualSubmit} />

        <TimerEntrySection
          topics={topics}
          draft={timerDraft}
          elapsedMs={elapsedMs}
          roundedTimerHours={roundedTimerHours}
          isRunning={timerStartedAt !== null}
          onChange={updateTimerDraft}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSubmit={handleTimerSubmit}
        />

        <TopicSection
          topics={topics}
          topicName={topicName}
          topicColor={topicColor}
          onTopicNameChange={setTopicName}
          onTopicColorChange={setTopicColor}
          onSubmit={handleTopicSubmit}
        />

        <SyncSettingsSection
          settings={settings}
          isSyncing={isSyncing}
          onSubmit={handleSettingsSubmit}
          onConnect={handleGoogleConnect}
          onDisconnect={handleDisconnectGoogle}
        />

        <EntriesSection entries={entries} topicMap={topicMap} />
      </section>
    </main>
  );
}

export default App;
