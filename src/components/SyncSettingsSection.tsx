import type { FormEvent } from 'react';
import type { AppSettings } from '../types';

type SyncSettingsSectionProps = {
  settings: AppSettings;
  isSyncing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
};

export function SyncSettingsSection({ settings, isSyncing, onSubmit, onConnect, onDisconnect }: SyncSettingsSectionProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Google Sheets sync</p>
          <h2>Configure your private sheet</h2>
        </div>
      </header>
      <form className="form-grid" onSubmit={onSubmit}>
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
        <button className="primary-button" type="button" onClick={() => void onConnect()} disabled={isSyncing}>
          {settings.token ? 'Refresh Google token' : 'Connect Google account'}
        </button>
        <button className="ghost-button" type="button" onClick={() => void onDisconnect()} disabled={!settings.token}>
          Disconnect token
        </button>
      </div>
      <p className="small-note">Rows are appended as: date, topic, task, hours, source, createdAt, entryId. Keep your sheet private and add a header row in the same order.</p>
    </article>
  );
}
