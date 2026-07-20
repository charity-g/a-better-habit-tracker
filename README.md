# a-better-habit-tracker

A Better Habit Tracker is a single-screen progressive web application for personal work logging. It is built as a local-first tracker that stores entries on-device, works offline, and queues Google Sheets sync until the device is back online.

## What the app does
The app is split into modules. Each module is droppable or addable to your static application. 

- Habits
    - MVP
- Tasks
    - WISHLIST TODO
- Data Science
    - WISHLIST TODO
- Budgeting
    - WISHLIST TODO
- Google Calendar Integrations
    - WISHLIST TODO

It works in layers. Each module stores directly into the indexedDB of the local browser.
- this indexedDb is also copied directly to a google sheets api 

On app startup or new item added, it will check if the user is logged in or has wifi.
- if either of those conditions are not met, it is unable to copy directly to google sheets api, it will do so when it gets back online

- then it will only store today's habits in indexedDb for sync

- it also handles if today's/yesterdays/ any day's items have been deleted and this delete needs to be synced
- you can lock days to not be editable

## I want this for myself too!
You want to fork this and create your own?


### Authenticating

### Hosting
- Use GitHub pages
 = GitHub Pages has a soft bandwidth limit (100GB/month) and a file size limit (1GB repo). 

- Using elsewhere

### Customizing

## Developing locally

`npm run dev`
`deno run dev`


