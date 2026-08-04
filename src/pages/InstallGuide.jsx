import { useEffect, useState } from 'react';

function InstallGuide() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(navigator.userAgent);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      if (standalone) setIsInstalled(true);
    };
    checkInstalled();
    window.addEventListener('appinstalled', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', checkInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const sectionStyle = { marginBottom: 40 };
  const cardStyle = {
    background: 'var(--color-bg-alt)',
    borderRadius: 16,
    padding: 28,
    marginBottom: 16,
  };
  const headingStyle = {
    fontSize: 20, fontWeight: 700, color: 'var(--color-text)',
    marginTop: 36, marginBottom: 12
  };
  const stepStyle = {
    color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.8,
    paddingLeft: 22, marginBottom: 8
  };
  const stepNumberStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'var(--color-brand)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    marginRight: 10,
    flexShrink: 0,
  };
  const tipStyle = {
    background: 'rgba(232, 93, 4, 0.08)',
    border: '1px solid rgba(232, 93, 4, 0.15)',
    borderRadius: 12,
    padding: '14px 18px',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    lineHeight: 1.7,
    marginTop: 16,
  };
  const stepRowStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
  };

  return (
    <div style={{ paddingTop: 84, marginBottom: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
          Install the App
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, marginBottom: 32 }}>
          Get Zesty Cave on your phone's home screen — it opens like a normal app, with no app store needed.
        </p>

        {isInstalled && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 12,
            padding: '16px 20px',
            color: 'var(--color-text)',
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 28,
          }}>
            You're using the installed Zesty Cave app.
          </div>
        )}

        {!isInstalled && !isIOS && (
          <button
            onClick={handleInstall}
            disabled={!deferredPrompt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              border: 'none',
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: deferredPrompt ? 'pointer' : 'not-allowed',
              opacity: deferredPrompt ? 1 : 0.6,
              boxShadow: '0 8px 24px rgba(232, 93, 4, 0.25)',
              marginBottom: 28,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {deferredPrompt ? 'Install Zesty Cave' : 'Use the steps below to install'}
          </button>
        )}

        {!isIOS && !isAndroid && !deferredPrompt && (
          <p style={{ ...stepStyle, marginBottom: 28, paddingLeft: 0 }}>
            Install the app on your phone by visiting this page from Safari (iPhone) or Chrome (Android).
          </p>
        )}

        <div style={sectionStyle}>
          <h2 style={headingStyle}>On iPhone or iPad (Safari)</h2>
          <div style={cardStyle}>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>1</span>
              <p style={stepStyle}>Open <strong>Safari</strong> and go to the Zesty Cave website.</p>
            </div>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>2</span>
              <p style={stepStyle}>Tap the <strong>Share</strong> button (square with an arrow pointing up) in the bottom toolbar.</p>
            </div>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>3</span>
              <p style={stepStyle}>Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.</p>
            </div>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>4</span>
              <p style={stepStyle}>Tap <strong>Add</strong> in the top-right corner. The Zesty Cave icon appears on your home screen.</p>
            </div>
            <div style={tipStyle}>
              <strong>Tip:</strong> If you don't see the option, make sure you're using Safari (not Chrome) and that you're not in a private browsing tab.
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>On an Android phone (Chrome)</h2>
          <div style={cardStyle}>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>1</span>
              <p style={stepStyle}>Open <strong>Chrome</strong> and go to the Zesty Cave website.</p>
            </div>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>2</span>
              <p style={stepStyle}>Tap the <strong>three-dot menu</strong> (⋮) in the top-right corner.</p>
            </div>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>3</span>
              <p style={stepStyle}>Tap <strong>Add to Home screen</strong> (or <strong>Install app</strong> if it appears).</p>
            </div>
            <div style={stepRowStyle}>
              <span style={stepNumberStyle}>4</span>
              <p style={stepStyle}>Tap <strong>Install</strong> on the confirmation dialog. The Zesty Cave icon appears on your home screen.</p>
            </div>
            <div style={tipStyle}>
              <strong>Tip:</strong> If the browser doesn't offer an install button, make sure Chrome is up to date and you're connected to the internet.
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Using the installed app</h2>
          <div style={cardStyle}>
            <p style={stepStyle}>The app opens in its own window, without the browser address bar.</p>
            <p style={stepStyle}>It works like a normal app: swipe-to-go-back gestures work, and updates are downloaded automatically in the background.</p>
            <p style={stepStyle}>When you open it the first time, allow notifications to receive order updates.</p>
            <p style={{ ...stepStyle, marginBottom: 0 }}>To uninstall, long-press the Zesty Cave icon and choose <strong>Remove App</strong> (iPhone) or <strong>Uninstall</strong> (Android), just like any other app.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallGuide;
