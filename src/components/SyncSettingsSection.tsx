import { useEffect, useState } from 'react';

type SyncSettingsInput = {
  googleClientId: string;
  spreadsheetId: string;
  sheetRange: string;
};

type AuthState = {
  isConnected: boolean;
  tokenExpiresAt: number | null;
  lastError: string | null;
};

type SyncSettingsSectionProps = {
  settings: SyncSettingsInput;
  auth: AuthState;
  isSyncing: boolean;
  onSubmit: (payload: SyncSettingsInput) => Promise<void>;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
};

export function SyncSettingsSection({ settings, auth, isSyncing, onSubmit, onConnect, onDisconnect }: SyncSettingsSectionProps) {
  const [draft, setDraft] = useState<SyncSettingsInput>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const tokenExpiryLabel = auth.tokenExpiresAt ? new Date(auth.tokenExpiresAt).toLocaleString() : 'Not connected';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(draft);
  };

  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Google Sheets sync</p>
          <h2>Configure your private sheet</h2>
        </div>
      </header>
      <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
        <label className="wide-field">
          Google OAuth Client ID
          <input
            name="googleClientId"
            value={draft.googleClientId}
            onChange={(event) => setDraft((current) => ({ ...current, googleClientId: event.target.value }))}
            placeholder="1234567890-abc.apps.googleusercontent.com"
          />
        </label>
        <label className="wide-field">
          Spreadsheet ID
          <input
            name="spreadsheetId"
            value={draft.spreadsheetId}
            onChange={(event) => setDraft((current) => ({ ...current, spreadsheetId: event.target.value }))}
            placeholder="Google Sheet ID from the URL"
          />
        </label>
        <label className="wide-field">
          Range
          <input
            name="sheetRange"
            value={draft.sheetRange}
            onChange={(event) => setDraft((current) => ({ ...current, sheetRange: event.target.value }))}
            placeholder="Entries!A:G"
          />
        </label>
        <button className="secondary-button" type="submit">
          Save sync settings
        </button>
      </form>
      <div className="settings-actions">
        <button className="primary-button" type="button" onClick={() => void onConnect()} disabled={isSyncing}>
          {auth.isConnected ? 'Refresh Google token' : 'Connect Google account'}
        </button>
        <button className="ghost-button" type="button" onClick={() => void onDisconnect()} disabled={!auth.isConnected}>
          Logout
        </button>
      </div>
      <p className="small-note">Auth status: {auth.isConnected ? 'Connected' : 'Disconnected'}. Token expiry: {tokenExpiryLabel}.</p>
      {auth.lastError ? <p className="small-note">Last auth error: {auth.lastError}</p> : null}
      <p className="small-note">Rows are appended as: date, topic, task, hours, source, createdAt, entryId. Keep your sheet private and add a header row in the same order.</p>
    </article>
  );
}
