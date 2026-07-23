function Loader({ text = "Loading..." }) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}>
        <div style={styles.spinnerInner} />
      </div>
      {text && <p style={styles.text}>{text}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: 20,
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '3.5px solid var(--color-border)',
    borderTopColor: 'var(--color-brand)',
    animation: 'spin 0.8s linear infinite',
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
  },
};

export default Loader;
