import { useEffect, useState } from 'react';
import { applyPwaUpdate } from '../pwa';

function UpdateAlert() {
  const [updateVisible, setUpdateVisible] = useState(false);
  const [offlineToast, setOfflineToast] = useState(false);

  useEffect(() => {
    let offlineTimer;
    const onUpdate = () => setUpdateVisible(true);
    const onOffline = () => {
      setOfflineToast(true);
      clearTimeout(offlineTimer);
      offlineTimer = setTimeout(() => setOfflineToast(false), 6000);
    };
    window.addEventListener('pwa:update-available', onUpdate);
    window.addEventListener('pwa:offline-ready', onOffline);
    return () => {
      clearTimeout(offlineTimer);
      window.removeEventListener('pwa:update-available', onUpdate);
      window.removeEventListener('pwa:offline-ready', onOffline);
    };
  }, []);

  const handleUpdate = () => {
    setUpdateVisible(false);
    applyPwaUpdate();
  };

  const bannerStyle = {
    position: 'fixed',
    bottom: 90,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#fff',
    border: '1px solid rgba(232, 93, 4, 0.25)',
    borderRadius: 14,
    padding: '12px 14px 12px 16px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
    maxWidth: 'min(92vw, 480px)',
    animation: 'updateBannerIn 0.3s ease-out',
  };

  return (
    <>
      {updateVisible && (
        <div style={bannerStyle} role="alert">
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: 'rgba(232, 93, 4, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
              A new version of Zesty Cave is available
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
              Update now to get the latest features
            </div>
          </div>
          <button
            onClick={handleUpdate}
            style={{
              flexShrink: 0,
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Update
          </button>
          <button
            onClick={() => setUpdateVisible(false)}
            aria-label="Dismiss update alert"
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: 16,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {offlineToast && (
        <div style={{ ...bannerStyle, borderColor: 'rgba(43, 147, 72, 0.3)', padding: '12px 18px' }}>
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: 'rgba(43, 147, 72, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2b9348" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l22 22" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-text)' }}>
            Zesty Cave is ready to work offline
          </div>
        </div>
      )}

      <style>{`
        @keyframes updateBannerIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}

export default UpdateAlert;
