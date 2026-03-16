/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<unknown>;
};

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

clientsClaim();
self.skipWaiting();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'QUEUE_SYNC') {
    event.waitUntil(notifyClients());
  }
});

self.addEventListener(
  'sync',
  ((event: Event) => {
    const syncEvent = event as SyncEvent;
    if (syncEvent.tag === 'habit-sync') {
      syncEvent.waitUntil(notifyClients());
    }
  }) as EventListener
);

async function notifyClients() {
  const matchedClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const client of matchedClients) {
    client.postMessage({ type: 'REQUEST_SYNC' });
  }
}