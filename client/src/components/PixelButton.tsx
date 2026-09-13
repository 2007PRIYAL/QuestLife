import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

type Variant = 'gold' | 'outline' | 'dark';

interface PixelButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  gold: 'bg-gradient-to-b from-[#FFE783] to-[#E8A623] text-[#3A2400] shadow-glow border-[#7A4E00]',
  outline: 'bg-[#0E1B2E] text-blue border-blue',
  dark: 'bg-[#0B1523] text-white border-[#000]',
};

export const PixelButton = ({
  variant = 'gold',
  icon,
  fullWidth = true,
  className = '',
  children,
  disabled,
  ...rest
}: PixelButtonProps) => {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={disabled}
      className={[
        'font-pixel text-[11px] leading-none py-4 px-4 rounded-pixel border-2',
        'flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {icon}
      <span>{children as React.ReactNode}</span>
    </motion.button>
  );
};
