type HeroSectionProps = {
  isSyncing: boolean;
  canInstall: boolean;
  onSync: () => void;
  onInstall: () => void;
};

export function HeroSection({ isSyncing, canInstall, onSync, onInstall }: HeroSectionProps) {
  return (
    <section className="hero-panel">
      <div>
        <p className="eyebrow">Single-screen personal tracker</p>
        <h1>A Better Habit Tracker</h1>
        <p className="hero-copy">
          Track work sessions, add manual logs, queue everything offline, and sync to your Google Sheet whenever the connection is available again.
        </p>
      </div>
      <div className="hero-actions">
        <button className="primary-button" type="button" onClick={onSync} disabled={isSyncing}>
          {isSyncing ? 'Syncing...' : 'Sync pending rows'}
        </button>
        {canInstall ? (
          <button className="secondary-button" type="button" onClick={onInstall}>
            Install app
          </button>
        ) : null}
      </div>
    </section>
  );
}
