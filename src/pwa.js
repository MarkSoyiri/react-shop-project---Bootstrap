import { registerSW } from 'virtual:pwa-register';

let refreshing = false;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;

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
