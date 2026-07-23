function GlobalLoader({ message }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.center}>
        <div style={styles.spinner} />
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '4px solid var(--color-border)',
    borderTopColor: 'var(--color-brand)',
    animation: 'spin 0.8s linear infinite',
  },
  message: {
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
  },
};

export default GlobalLoader;
