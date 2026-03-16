# a-better-habit-tracker

A Better Habit Tracker is a single-screen progressive web application for personal work logging. It is built as a local-first tracker that stores entries on-device, works offline, and queues Google Sheets sync until the device is back online.

## What the app does

- Logs manual entries with topic, task, hours, and date.
- Captures timed sessions and rounds them to quarter-hour increments.
- Lets you manage your own topic list.
- Stores everything in IndexedDB so entries survive reloads and offline use.
- Queues unsynced rows locally and appends them to a private Google Sheet when authorization and connectivity are available.
- Installs as a PWA on desktop or mobile.

## Tech stack

- React + TypeScript + Vite
- IndexedDB via `idb`
- Custom service worker through `vite-plugin-pwa`
- Google Identity Services + Google Sheets API

## Run locally

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## Google Sheets setup

1. Create a Google Cloud project.
2. Enable the Google Sheets API.
3. Create an OAuth client for a web application.
4. Add your local dev origin and your deployed origin to the authorized JavaScript origins.
5. Create a private Google Sheet with a tab such as `Entries`.
6. Add a header row in this order:

```text
date | topic | task | hours | source | createdAt | entryId
```

7. Copy the OAuth client ID and spreadsheet ID into the app settings panel.
8. Keep the default range `Entries!A:G` unless your sheet layout changes.

## Free hosting options

This is a static app, so free hosting is straightforward. Good fits:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages

For Google OAuth, the deployed origin must match the authorized JavaScript origins in your Google Cloud OAuth client.

## Offline and background sync notes

- The app shell and locally stored data remain available offline.
- New entries are written immediately to IndexedDB.
- Unsynced entries are placed in a local queue.
- The service worker asks the app to retry sync when connectivity returns.
- Google Sheets sync still depends on a valid Google OAuth access token. If the token expires, reconnect once and retry sync.

## Current scope

This version focuses on a structured, configurable layout and the complete local-first workflow. It intentionally keeps the visual system restrained so future UI theming changes are easy to make.

