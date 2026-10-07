import { motion } from 'framer-motion';

export default function Skeleton({ count = 3, className = "h-24" }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className={`bg-white/5 rounded-xl w-full ${className}`}
        />
      ))}
    </div>
  );
}
