import { motion } from "framer-motion";

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <motion.div
        className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      />
    </div>
  );
}

export default Loader;
