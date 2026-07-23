import { useState, useEffect } from 'react';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const typeConfig = {
  success: { color: 'var(--color-accent)', bg: 'var(--color-success-light)', icon: '✓' },
  error: { color: '#e53e3e', bg: 'var(--color-error-light)', icon: '✕' },
  info: { color: 'var(--color-info)', bg: 'var(--color-info-light)', icon: 'ℹ' },
  warning: { color: 'var(--color-warning)', bg: 'var(--color-warning-light)', icon: '⚠' },
};

const ToastItem = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const config = typeConfig[toast.type] || typeConfig.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      style={{
        ...styles.toast,
        borderLeftColor: config.color,
        animation: exiting ? 'toastSlideOut 0.3s ease-in forwards' : 'toastSlideIn 0.3s ease-out',
        pointerEvents: 'all',
      }}
      role="alert"
    >
      <div style={{ ...styles.iconCircle, background: config.bg }}>
        <span style={{ color: config.color, fontSize: 16, fontWeight: 700 }}>{config.icon}</span>
      </div>
      <span style={styles.message}>{toast.message}</span>
      <button
        onClick={handleClose}
        style={styles.closeBtn}
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 88,
    right: 24,
    zIndex: 1070,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 380,
    width: '100%',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)',
    borderLeft: '4px solid',
    minWidth: 300,
    pointerEvents: 'all',
    animation: 'toastSlideIn 0.3s ease-out',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-text)',
    lineHeight: 1.4,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-full)',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition)',
    flexShrink: 0,
  },
};

const toastKeyframes = document.createElement('style');
toastKeyframes.textContent = `
  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastSlideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(40px); }
  }
`;
document.head.appendChild(toastKeyframes);

// eslint-disable-next-line react-refresh/only-export-components -- useToast hook co-located with Toast by design
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast, Toast };
};

export default Toast;
