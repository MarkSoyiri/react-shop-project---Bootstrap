import { useEffect } from "react";

export function LoadingScreen() {
  useEffect(() => {
    const loadingWrapper = document.getElementById("loadSpinner");

    window.addEventListener("load", () => {
      setTimeout(() => {
        if (loadingWrapper) {
          loadingWrapper.style.opacity = "0";
          loadingWrapper.style.pointerEvents = "none";
        }
      }, 1000);
    });
  }, []);

  return (
    <div
      id="loadSpinner"
      className="loadingWrapper d-flex justify-content-center align-items-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "white",
        zIndex: 9999,
        transition: "opacity 0.8s ease"
      }}
    >
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
