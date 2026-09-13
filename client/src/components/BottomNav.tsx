import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Map, ScrollText, Timer, User } from 'lucide-react';

const TABS = [
  { to: '/dashboard', label: 'Home', icon: Compass },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/quests', label: 'Quests', icon: ScrollText },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/stats', label: 'Profile', icon: User },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="sticky bottom-0 z-30 bg-surface border-t-2 border-black flex items-stretch shadow-lg"
      aria-label="Primary"
    >
      {TABS.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={[
              'relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5',
              'font-pixel text-[8px] transition-colors',
              isActive ? 'text-gold' : 'text-[#5C7A9E] hover:text-blue',
            ].join(' ')}
          >
            {isActive && (
              <motion.span
                layoutId="bottom-nav-indicator"
                className="absolute top-0 left-2 right-2 h-0.5 bg-gold rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <Icon size={19} strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
            {isActive && <span className="sr-only">(current)</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};
