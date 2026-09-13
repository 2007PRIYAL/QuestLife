import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}

export const ToggleSwitch = ({ checked, onChange, disabled, label }: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative w-11 h-6 rounded-full border-2 border-black shrink-0 transition-colors',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        checked ? 'bg-gold' : 'bg-[#0E1B2E]',
      ].join(' ')}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow"
        animate={{ x: checked ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
};
