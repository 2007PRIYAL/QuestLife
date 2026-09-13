import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
}

// Fixed to the viewport (so it stays put while the quest list scrolls),
// but constrained to a max-w-app strip so it lines up with the phone
// frame's right edge instead of the real browser edge on desktop.
export const FloatingActionButton = ({ onClick, label }: FloatingActionButtonProps) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
      <div className="relative w-full max-w-app h-0">
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={label}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="pointer-events-auto absolute right-4 bottom-20 w-14 h-14 rounded-full bg-gradient-to-b from-[#FFE783] to-[#E8A623] border-2 border-black shadow-glow flex items-center justify-center"
        >
          <Plus size={26} className="text-[#3A2400]" aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  );
};
