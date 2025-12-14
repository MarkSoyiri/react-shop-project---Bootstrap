// import { motion } from "framer-motion";

// function Loader() {
//   return (
//     <div className="flex items-center justify-center h-screen">
//       <motion.div
//         className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full"
//         animate={{ rotate: 360 }}
//         transition={{
//           repeat: Infinity,
//           duration: 1,
//           ease: "linear",
//         }}
//       />
//     </div>
//   );
// }

// export default Loader;


function Loader() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "6px solid #ccc",
    borderTop: "6px solid #111",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default Loader;

