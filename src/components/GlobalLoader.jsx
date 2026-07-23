function GlobalLoader() {
  return (
    <div style={styles.overlay}>
      <div style={styles.spinner} />
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    backgroundColor: "rgba(255,255,255,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #e85d04",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

export default GlobalLoader;
