// SyncSettings.tsx
//
// Example of how to surface the opt-in Google Sheets sync in your settings
// UI. Adjust styling/markup to match your app — the logic/state wiring is
// the part that matters.

import { useState } from "preact/hooks";
import { applicationStore } from "../store/appStore";

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

  return (
    <div class="sync-settings">
      <h3>Sync to Google Sheets</h3>
      <p class="sync-settings__description">
        Optional — your data stays on this device either way. Connect a Google
        Sheet to also back it up to your own Drive.
      </p>

      {isConnected ? (
        <div class="sync-settings__connected">
          <p>
            Syncing to <strong>{sheetName}</strong>
          </p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <div class="sync-settings__disconnected">
          {auth.status === "signed-in" && (
            <p class="sync-settings__hint">
              Signed in to Google — pick a sheet to finish connecting.
            </p>
          )}
          <button onClick={handleConnect} disabled={busy}>
            {busy ? "Connecting…" : "Connect Google Sheet"}
          </button>
          {error && <p class="sync-settings__error">{error}</p>}
        </div>
      )}
    </div>
  );
}