// SyncSettings.tsx
//
// Example of how to surface the opt-in Google Sheets sync in your settings
// UI. Adjust styling/markup to match your app — the logic/state wiring is
// the part that matters.

import { useState } from "preact/hooks";
import { applicationStore } from "../store/appStore";

function UserIcon() {
  return (
    <svg class="sync-settings__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

export function SyncSettings() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = applicationStore.googleAuth;
  const sheetName = applicationStore.linkedSpreadsheetName;
  const isConnected = applicationStore.isSyncEnabled;

  async function handleConnect() {
    setBusy(true);
    setError(null);
    const result = await applicationStore.connectGoogleSheet();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  function handleDisconnect() {
    applicationStore.disconnectGoogleSheet();
  }

  async function handleUseLocalOnly() {
    setBusy(true);
    setError(null);
    applicationStore.disconnectGoogleSheet();
    setBusy(false);
  }

  return (
    <section class="sync-settings">
      <header class="sync-settings__hero">
        <div class="sync-settings__title-row">
          <UserIcon />
          <div>
            <p class="sync-settings__eyebrow">Account</p>
            <h2>Choose how your data syncs</h2>
          </div>
        </div>
        <p class="sync-settings__description">
          Keep everything in IndexedDB on this device, or connect your Google
          account and store logs in a Google Sheet you control.
        </p>
      </header>

      <div class="sync-settings__grid">
        <article class="sync-card sync-card--accent">
          <div class="sync-card__copy">
            <p class="sync-card__eyebrow">Google Sheets</p>
            <h3>{isConnected ? "Connected" : "Sign in and connect"}</h3>
            <p>
              {isConnected
                ? `Syncing to ${sheetName}. New logs will keep flowing to that sheet.`
                : auth.status === "signed-in"
                  ? "You are signed in. Pick the spreadsheet you want to use next."
                  : "Sign in with Google, then choose a sheet to create the connection."}
            </p>
          </div>

          {isConnected ? (
            <div class="sync-card__actions">
              <button onClick={handleConnect} disabled={busy}>
                {busy ? "Working…" : "Change Google Sheet"}
              </button>
              <button class="secondary" onClick={handleDisconnect} disabled={busy}>
                Disconnect
              </button>
            </div>
          ) : (
            <div class="sync-card__actions">
              <button onClick={handleConnect} disabled={busy}>
                {busy
                  ? "Working…"
                  : auth.status === "signed-in"
                    ? "Pick Google Sheet"
                    : "Sign in with Google"}
              </button>
            </div>
          )}

          {error && <p class="sync-settings__error">{error}</p>}
        </article>

        <article class="sync-card sync-card--muted">
          <div class="sync-card__copy">
            <p class="sync-card__eyebrow">Local only</p>
            <h3>Persist on this device</h3>
            <p>
              Stay fully local and keep everything in IndexedDB. You can add a
              Google Sheet later if you want a backup or shared history.
            </p>
          </div>

          <div class="sync-card__actions">
            <button class="secondary" onClick={handleUseLocalOnly} disabled={busy}>
              Use local storage only
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}