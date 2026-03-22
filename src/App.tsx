import { useMemo, useState } from 'react';
import { EntriesSection } from './components/EntriesSection';
import { HeroSection } from './components/HeroSection';
import { ManualEntrySection } from './components/ManualEntrySection';
import { StatusStrip } from './components/StatusStrip';
import { SyncBannerSection } from './components/SyncBannerSection';
import { SyncSettingsSection } from './components/SyncSettingsSection';
import { TimerEntrySection } from './components/TimerEntrySection';
import { TopicSection } from './components/TopicSection';
import { useHabitTracker } from './hooks/useHabitTracker';
import { roundToQuarter } from './lib/utils';

function App() {
  const {
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
  } = useHabitTracker();

  const [timerElapsedMs, setTimerElapsedMs] = useState(0);
  const roundedTimerHours = useMemo(() => roundToQuarter(timerElapsedMs / 3_600_000), [timerElapsedMs]);

  if (!isHydrated) {
    return <main className="app-shell loading-shell">Loading tracker...</main>;
  }

  return (
    <main className="app-shell">
      <HeroSection isSyncing={isSyncing} canInstall={installPrompt !== null} onSync={() => void attemptSync()} onInstall={() => void handleInstall()} />

      <StatusStrip
        isOnline={isOnline}
        pendingEntries={pendingEntries}
        todayHours={stats.today}
        yesterdayHours={stats.yesterday}
        weekHours={stats.week}
        topicCount={topics.length}
      />

      <SyncBannerSection banner={syncBanner} />

      <section className="content-grid">
        <ManualEntrySection topics={topics} onSubmit={handleManualSubmit} />

        <TimerEntrySection topics={topics} roundedTimerHours={roundedTimerHours} onElapsedMsChange={setTimerElapsedMs} onSubmit={handleTimerSubmit} />

        <TopicSection topics={topics} onSubmit={handleTopicSubmit} />

        <SyncSettingsSection
          settings={syncSettings}
          auth={authState}
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
