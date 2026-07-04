// googleAuth.ts
//
// Thin wrapper around Google Identity Services (GIS) "token client" model.
// - No backend, no client secret, no refresh tokens stored anywhere.
// - The access token lives ONLY in memory (a module-level variable). It is
//   never written to localStorage/sessionStorage/IndexedDB. On a hard page
//   reload the user will be silently (or interactively, on first run)
//   re-prompted — this is intentional and is the standard tradeoff for the
//   token-client / implicit-style model.
// - Scope is the narrow, non-sensitive `drive.file` scope: this app can only
//   ever see files it created or that the user explicitly picked via the
//   Google Picker. It cannot enumerate or read the rest of the user's Drive.
//
// Docs: https://developers.google.com/identity/oauth2/web/guides/use-token-model

import { signal } from "@preact/signals";

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

// --- Config -----------------------------------------------------------

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
export const GOOGLE_PICKER_API_KEY = import.meta.env.VITE_GOOGLE_PICKER_API_KEY as string;
export const GOOGLE_CLOUD_PROJECT_NUMBER = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_NUMBER as string | undefined;

// Narrowest scope that can read/write a sheet: app-created or user-picked
// files only. Do NOT broaden this to `spreadsheets` or `drive` without a
// good reason — it changes what the OAuth consent screen shows the user
// and may require additional Google verification for your app.
const SCOPES = "https://www.googleapis.com/auth/drive.file";

// --- State --------------------------------------------------------------

export type GoogleAuthState =
  | { status: "signed-out" }
  | { status: "signing-in" }
  | { status: "signed-in"; accessToken: string; expiresAt: number }
  | { status: "error"; message: string };

export const googleAuthSignal = signal<GoogleAuthState>({ status: "signed-out" });

let tokenClient: any = null;
let gisScriptLoaded: Promise<void> | null = null;
let pickerScriptLoaded: Promise<void> | null = null;

// --- Script loading -------------------------------------------------------

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function loadGisScript(): Promise<void> {
  if (!gisScriptLoaded) {
    gisScriptLoaded = loadScript("https://accounts.google.com/gsi/client");
  }
  return gisScriptLoaded;
}

function loadPickerScript(): Promise<void> {
  if (!pickerScriptLoaded) {
    pickerScriptLoaded = loadScript("https://apis.google.com/js/api.js").then(
      () =>
        new Promise<void>((resolve, reject) => {
          window.gapi.load("picker", {
            callback: () => resolve(),
            onerror: () => reject(new Error("Failed to load Picker API")),
          });
        }),
    );
  }
  return pickerScriptLoaded;
}

// --- Token client ---------------------------------------------------------

function ensureTokenClient(): Promise<any> {
  return loadGisScript().then(() => {
    if (tokenClient) return tokenClient;

    if (!GOOGLE_CLIENT_ID) {
      throw new Error(
        "VITE_GOOGLE_CLIENT_ID is not set. Create an OAuth Client ID in " +
          "Google Cloud Console (Application type: Web application) and add " +
          "it to your .env file.",
      );
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      // callback is set per-request below (requestToken), since GIS lets us
      // override it on each requestAccessToken() call via the promise wrapper.
      callback: () => {},
    });
    return tokenClient;
  });
}

/**
 * Requests an access token from Google.
 *
 * @param interactive - if true, shows the account chooser / consent screen
 *   if needed (use this for an explicit user-initiated "Sign in" click).
 *   If false, attempts a silent/background request only (used for refresh);
 *   if Google can't issue a token silently, the promise rejects rather than
 *   popping a UI the user didn't ask for.
 */
function requestToken(interactive: boolean): Promise<{ access_token: string; expires_in: number }> {
  return ensureTokenClient().then(
    (client) =>
      new Promise((resolve, reject) => {
        client.callback = (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          resolve(response);
        };
        client.error_callback = (err: any) => {
          reject(new Error(err?.message || "Google sign-in was cancelled or failed."));
        };
        client.requestAccessToken({
          prompt: interactive ? "consent" : "",
        });
      }),
  );
}

// --- Public API -------------------------------------------------------

/**
 * Explicit, user-initiated sign-in. Call this from a click handler (Google
 * requires a user gesture to show the consent popup reliably).
 */
export async function signIn(): Promise<void> {
  googleAuthSignal.value = { status: "signing-in" };
  try {
    const response = await requestToken(true);
    googleAuthSignal.value = {
      status: "signed-in",
      accessToken: response.access_token,
      // expires_in is seconds; keep a 60s safety margin before real expiry.
      expiresAt: Date.now() + (response.expires_in - 60) * 1000,
    };
  } catch (err) {
    googleAuthSignal.value = {
      status: "error",
      message: err instanceof Error ? err.message : "Sign-in failed.",
    };
  }
}

export function signOut(): void {
  const state = googleAuthSignal.value;
  if (state.status === "signed-in" && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(state.accessToken, () => {});
  }
  googleAuthSignal.value = { status: "signed-out" };
}

/**
 * Returns a currently-valid access token, transparently refreshing in the
 * background (silently, no popup) if the cached one is close to expiry.
 * Returns null if the user isn't signed in, or if a silent refresh fails
 * (e.g. consent was revoked elsewhere) — callers should fall back to
 * local-only behavior and surface a "please sign in again" prompt rather
 * than throwing, since this is expected to happen periodically.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const state = googleAuthSignal.value;

  if (state.status !== "signed-in") return null;

  if (Date.now() < state.expiresAt) {
    return state.accessToken;
  }

  // Token expired or about to — try a silent refresh first.
  try {
    const response = await requestToken(false);
    googleAuthSignal.value = {
      status: "signed-in",
      accessToken: response.access_token,
      expiresAt: Date.now() + (response.expires_in - 60) * 1000,
    };
    return response.access_token;
  } catch {
    // Silent refresh failed — don't surface a popup unprompted. Drop back
    // to signed-out so the UI can show a "sign in again" affordance.
    googleAuthSignal.value = { status: "signed-out" };
    return null;
  }
}

export function isSignedIn(): boolean {
  return googleAuthSignal.value.status === "signed-in";
}

// --- Google Picker (used to select an existing Sheet) ---------------------

export interface PickedSheet {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

/**
 * Opens the Google Picker, scoped to spreadsheets only, using the same
 * drive.file-scoped token as the rest of the app. Resolves with the picked
 * sheet's file ID, or null if the user cancelled.
 *
 * Picking a file through this UI is what actually grants this app's
 * drive.file token access to that specific file — pasting a raw file ID
 * into a text box would NOT grant access, since the app never "touched"
 * the file from Google's point of view.
 */
export async function pickExistingSheet(): Promise<PickedSheet | null> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("Sign in with Google before picking a sheet.");
  }
  if (!GOOGLE_PICKER_API_KEY) {
    throw new Error(
      "VITE_GOOGLE_PICKER_API_KEY is not set. Create a restricted API key " +
        "in Google Cloud Console for Picker rendering.",
    );
  }

  await loadPickerScript();

  return new Promise<PickedSheet | null>((resolve) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
      .setMode(window.google.picker.DocsViewMode.LIST)
      .setMimeTypes("application/vnd.google-apps.spreadsheet");

    const pickerBuilder = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_PICKER_API_KEY)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          resolve({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            mimeType: doc.mimeType,
          });
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      });

    if (GOOGLE_CLOUD_PROJECT_NUMBER) {
      pickerBuilder.setAppId(GOOGLE_CLOUD_PROJECT_NUMBER);
    }

    const picker = pickerBuilder.build();

    picker.setVisible(true);
  }).catch((err) => {
    throw err instanceof Error ? err : new Error("Picker failed to open.");
  });
}