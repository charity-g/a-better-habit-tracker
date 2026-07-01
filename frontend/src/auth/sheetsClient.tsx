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
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const isAuthError = response.status === 401 || response.status === 403;
    throw new SheetsApiError(
      `Sheets API error ${response.status}: ${body || response.statusText}`,
      response.status,
      isAuthError,
    );
  }

  return response.json();
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
  const meta = await sheetsFetch(`${SHEETS_API_BASE}/${spreadsheetId}`, accessToken);
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