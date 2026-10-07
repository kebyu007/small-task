import { motion } from 'framer-motion';
import { Ghost } from 'lucide-react';

export default function EmptyState({ message = "Hozircha ma'lumot yo'q" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-16 flex flex-col items-center justify-center text-center text-gray-400 space-y-4"
    >
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
        <Ghost size={32} className="opacity-50" />
      </div>
      <p className="text-lg font-medium">{message}</p>
    </motion.div>
  );
}
