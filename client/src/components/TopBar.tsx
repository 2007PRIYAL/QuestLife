import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, Coins, Flame, User } from 'lucide-react';
import { getXpProgress } from '@/utils/gamification';
import { getCharacterEvolution } from '@/utils/characterEvolution';
import { getCharacterById } from '@/utils/characters';
import type { Profile } from '@/types';

interface TopBarProps {
  profile: Profile;
  onSettingsClick?: () => void;
}

export const TopBar = ({ profile, onSettingsClick }: TopBarProps) => {
  const navigate = useNavigate();
  const { requiredXp, progressPercent } = getXpProgress(profile.level, profile.current_xp);
  const evolution = getCharacterEvolution(profile.level);
  const character = getCharacterById(profile.avatar_url);
  const IconComponent = character?.icon || User;
  const handleSettingsClick = onSettingsClick ?? (() => navigate('/settings'));

  return (
    <header className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface border-b-2 border-black sticky top-0 z-30 shadow-md">
      {/* Avatar with Evolution Frame */}
      <button
        type="button"
        onClick={() => navigate('/stats')}
        title={`${character?.name || 'Hero'} (${evolution.rankTitle})`}
        className="relative shrink-0 group focus:outline-none cursor-pointer"
      >
        <div
          className={[
            'w-11 h-11 rounded-pixel flex items-center justify-center bg-[#0E1B2E] transition-transform active:scale-95',
            evolution.borderClass,
            evolution.glowClass,
          ].join(' ')}
          style={{ color: character?.color || '#FFD93D' }}
        >
          <IconComponent size={22} aria-hidden="true" />
        </div>
        <span
          className={[
            'absolute -bottom-1 -right-1 font-pixel text-[6px] px-1 py-0.2 rounded border border-black',
            evolution.badgeBg,
          ].join(' ')}
        >
          T{evolution.tier}
        </span>
      </button>

      {/* Level & XP bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-pixel text-[9px] text-white flex items-center gap-1">
            Lv. {profile.level}
            <span className="text-[7px] text-[#8CA6C4] font-normal truncate max-w-[80px]">
              {evolution.rankTitle}
            </span>
          </span>
          <span className="font-pixel text-[7px] text-blue">
            {profile.current_xp}/{requiredXp} XP
          </span>
        </div>
        <div
          className="h-2.5 w-full bg-black rounded-full overflow-hidden border border-black"
          role="progressbar"
          aria-label="Experience progress"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-[#FFB93D]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Streak */}
      <div
        className="flex items-center gap-1 font-pixel text-[9px] text-[#FF9F4D] shrink-0 bg-black/40 px-1.5 py-1 rounded border border-[#FF9F4D]/30"
        title={`${profile.current_streak || 0} Day Streak`}
      >
        <Flame size={13} className="text-[#FF9F4D]" />
        <span>{profile.current_streak || 0}d</span>
      </div>

      {/* Coins */}
      <div
        className="flex items-center gap-1 font-pixel text-[9px] text-gold shrink-0 bg-black/40 px-1.5 py-1 rounded border border-gold/30"
        title={`${profile.coins} Coins`}
      >
        <Coins size={13} />
        <span>{profile.coins.toLocaleString()}</span>
      </div>

      {/* Settings */}
      <button
        type="button"
        onClick={handleSettingsClick}
        aria-label="Settings"
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-pixel bg-[#0E1B2E] pixel-border text-white hover:text-gold active:scale-95 transition-colors cursor-pointer"
      >
        <Settings size={15} aria-hidden="true" />
      </button>
    </header>
  );
};
