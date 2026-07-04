// sheetsClient.ts
//
// Minimal REST wrapper over the Google Sheets API v4. Deliberately uses
// plain `fetch` with a Bearer token rather than loading gapi.client — one
// fewer script to load, and the REST surface we need (append rows, batch
// read) is simple enough not to need the discovery-doc client library.
//
// All calls take an explicit accessToken argument rather than reaching into
// googleAuth.ts themselves — keeps this module testable and makes the
// "who's responsible for refreshing the token" boundary explicit (that's
// the caller's job, via getValidAccessToken()).

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatSheetsError(bodyText: string, fallback: string): string {
  if (!bodyText) return fallback;

  try {
    const parsed = JSON.parse(bodyText);
    const apiMessage = parsed?.error?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }
  } catch {
    // Body was not JSON; fall back to raw text below.
  }

  return bodyText;
}

export class SheetsApiError extends Error {
  public status: number;
  public isAuthError: boolean;

  constructor(
    message: string,
    status: number,
    isAuthError: boolean,
  ) {
    super(message);

    this.name = "SheetsApiError";
    this.status = status;
    this.isAuthError = isAuthError;
  }
}

async function sheetsFetch(url: string, accessToken: string, init?: RequestInit) {
  const method = init?.method ?? "GET";
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    if (response.ok) {
      return response.json();
    }

    const body = await response.text().catch(() => "");
    const isAuthError = response.status === 401 || response.status === 403;
    const message = formatSheetsError(body, response.statusText || "Request failed");

    if (attempt < maxAttempts && RETRYABLE_STATUS.has(response.status)) {
      // Exponential backoff with small jitter for transient Google API errors.
      const backoffMs = Math.min(2000, 300 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 150);
      await delay(backoffMs);
      continue;
    }

    throw new SheetsApiError(
      `Sheets API ${method} ${url} failed (${response.status}): ${message}`,
      response.status,
      isAuthError,
    );
  }

  throw new SheetsApiError(
    `Sheets API ${method} ${url} failed after retries.`,
    500,
    false,
  );
}

/**
 * Confirms a sheet/tab exists with the given name inside the spreadsheet,
 * creating it if missing. Call once per session (or cache the result) —
 * no need to do this before every write.
 */
export async function ensureSheetTabExists(
  spreadsheetId: string,
  accessToken: string,
  tabName: string,
): Promise<void> {
  const fields = encodeURIComponent("sheets.properties.title");
  const meta = await sheetsFetch(`${SHEETS_API_BASE}/${spreadsheetId}?fields=${fields}`, accessToken);
  const exists = meta.sheets?.some((s: any) => s.properties?.title === tabName);
  if (exists) return;

  await sheetsFetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: tabName } } }],
    }),
  });
}

/**
 * Appends rows to the end of a sheet tab. Each row is an array of cell
 * values in column order — callers own the mapping from their domain model
 * to row shape (keep that mapping next to the model, e.g. in habitModel.ts,
 * so this client stays domain-agnostic).
 */
export async function appendRows(
  spreadsheetId: string,
  accessToken: string,
  tabName: string,
  rows: unknown[][],
): Promise<void> {
  const range = encodeURIComponent(`${tabName}!A1`);
  await sheetsFetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ values: rows }),
    },
  );
}

/**
 * Reads all rows from a tab (used on initial sync-down / reconciliation,
 * if your app needs to read back what's in Sheets — optional for a
 * write-mostly log).
 */
export async function readAllRows(
  spreadsheetId: string,
  accessToken: string,
  tabName: string,
): Promise<unknown[][]> {
  const range = encodeURIComponent(`${tabName}!A:Z`);
  const data = await sheetsFetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${range}`, accessToken);
  return data.values ?? [];
}