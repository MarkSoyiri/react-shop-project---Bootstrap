import Loader from "./Loader";

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-80">
      <Loader />
    </div>
  );
}
