import { registerSW } from 'virtual:pwa-register';

let refreshing = false;
let applyUpdate = null;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

const sw = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('pwa:update-available'));
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('pwa:offline-ready'));
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;
    applyUpdate = () => sw.update();

    const checkForUpdates = async () => {
      if (navigator.onLine === false) return;
      try {
        const response = await fetch(swUrl, { cache: 'no-store' });
        if (response?.status === 200) await registration.update();
      } catch { /* offline or network error, try again later */ }
    };

    setInterval(checkForUpdates, 30 * 60 * 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdates();
    });

    window.addEventListener('online', checkForUpdates);
  },
});

export function applyPwaUpdate() {
  if (applyUpdate) applyUpdate();
}
