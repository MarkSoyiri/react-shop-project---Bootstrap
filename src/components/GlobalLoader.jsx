import Loader from "./Loader";

function GlobalLoader() {
  return (
    <div style={styles.overlay}>
      <Loader />
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
};

export default GlobalLoader;
