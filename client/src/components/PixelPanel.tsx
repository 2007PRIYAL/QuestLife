import type { HTMLAttributes } from 'react';

interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'blue' | 'gold';
}

export const PixelPanel = ({ tone = 'blue', className = '', children, ...rest }: PixelPanelProps) => {
  return (
    <div
      className={[
        'bg-card rounded-pixel border-2 border-black',
        tone === 'blue' ? 'shadow-pixel' : 'shadow-pixel-gold',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
};
