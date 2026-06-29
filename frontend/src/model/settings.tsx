
export type AppSettings = {
  googleSheetsApiKey: string;
  spreadsheetId: string;
  sheetName: string;
};

export const defaultSettings: AppSettings = {
  googleSheetsApiKey: '',
  spreadsheetId: '',
  sheetName: '',
};