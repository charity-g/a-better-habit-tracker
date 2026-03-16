import type { AppSettings, GoogleAuthToken } from '../types';

const GOOGLE_IDENTITY_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

let loaderPromise: Promise<void> | null = null;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Google Identity Services.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Google Identity Services.'));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export async function requestGoogleToken(clientId: string, prompt: '' | 'consent' = 'consent') {
  if (!clientId.trim()) {
    throw new Error('Add your Google OAuth client ID before connecting.');
  }

  await loadGoogleIdentityScript();

  return new Promise<GoogleAuthToken>((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPE,
      callback: (response) => {
        resolve({
          accessToken: response.access_token,
          expiresAt: Date.now() + response.expires_in * 1000
        });
      },
      error_callback: () => reject(new Error('Google authorization was cancelled or blocked.'))
    });

    if (!tokenClient) {
      reject(new Error('Google authorization client could not be created.'));
      return;
    }

    tokenClient.requestAccessToken({ prompt });
  });
}

export async function appendRowToSheet(settings: AppSettings, row: Array<string | number>) {
  if (!settings.token?.accessToken) {
    throw new Error('Connect your Google account before syncing.');
  }

  if (!settings.spreadsheetId.trim() || !settings.sheetRange.trim()) {
    throw new Error('Spreadsheet ID and range are required for sync.');
  }

  const encodedRange = encodeURIComponent(settings.sheetRange);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${settings.spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.token.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [row] })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Google Sheets request failed with ${response.status}.`);
  }
}