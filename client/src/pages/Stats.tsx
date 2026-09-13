import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Dumbbell,
  Brain,
  BookOpen,
  Wind,
  BarChart3,
  Trophy,
  Settings as SettingsIcon,
  Store,
  Sparkles,
  ChevronRight,
  User,
} from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { PixelPanel } from '@/components/PixelPanel';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { RadarChart } from '@/components/RadarChart';
import { fetchProfile } from '@/api/profile';
import { getApiErrorMessage } from '@/api/client';
import { getXpProgress } from '@/utils/gamification';
import { getCharacterEvolution } from '@/utils/characterEvolution';
import { getCharacterById } from '@/utils/characters';
import { useAuth } from '@/context/AuthContext';
import type { Profile } from '@/types';

const STAT_ROWS = [
  { key: 'health', label: 'Health', icon: Heart, color: '#FF4B4B' },
  { key: 'strength', label: 'Strength', icon: Dumbbell, color: '#FF9F4D' },
  { key: 'intelligence', label: 'Intelligence', icon: Brain, color: '#4DA6FF' },
  { key: 'wisdom', label: 'Wisdom', icon: BookOpen, color: '#B983FF' },
  { key: 'agility', label: 'Agility', icon: Wind, color: '#4CAF50' },
] as const;

export const Stats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProfile();
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load your stats.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Reading your character sheet..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-shell">
        <div className="p-4">
          <ErrorBanner message={error || 'Profile unavailable.'} />
        </div>
        <BottomNav />
      </div>
    );
  }

  const { requiredXp, progressPercent } = getXpProgress(profile.level, profile.current_xp);
  const maxStat = Math.max(100, ...STAT_ROWS.map((r) => profile[r.key]));
  const evolution = getCharacterEvolution(profile.level);
  const character = getCharacterById(profile.avatar_url);
  const AvatarIcon = character?.icon || User;

  return (
    <div className="app-shell">
      <TopBar profile={profile} />

      <div className="px-4 pt-3.5 pb-2">
        <p className="font-pixel text-[7px] text-blue mb-0.5">HERO DOSSIER & PROFILE</p>
        <h1 className="font-pixel text-[13px] text-gold text-shadow-pixel">Character Sheet</h1>
        <p className="text-[10px] text-[#8CA6C4] mt-0.5">
          Level {profile.level} • {evolution.rankTitle}
        </p>
      </div>

      <div className="flex-1 px-4 pb-8 flex flex-col gap-3.5 overflow-y-auto">
        {error && <ErrorBanner message={error} />}

        {/* 1. Character Overview Panel */}
        <PixelPanel tone="blue" className="p-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div
              onClick={() => navigate('/character-select')}
              className={[
                'w-14 h-14 rounded-pixel flex items-center justify-center bg-[#0E1B2E] shrink-0 cursor-pointer',
                evolution.borderClass,
                evolution.glowClass,
              ].join(' ')}
              style={{ color: character?.color || '#FFD93D' }}
            >
              <AvatarIcon size={28} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-pixel text-[11px] text-white truncate">
                  {user?.username || 'Hero'}
                </p>
                <span
                  className={[
                    'font-pixel text-[6px] px-1.5 py-0.5 rounded border border-black',
                    evolution.badgeBg,
                  ].join(' ')}
                >
                  {evolution.badgeLabel}
                </span>
              </div>
              <p className="text-[9px] text-[#8CA6C4] mt-0.5">
                Class: {character?.title || 'Adventurer'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[8px] font-pixel">
                <span className="text-gold">🪙 {profile.coins}</span>
                <span className="text-[#4CAF50]">⚔️ {profile.total_quests_completed} Quests</span>
              </div>
            </div>
          </div>

          <div className="mb-1 flex justify-between text-[8px] font-pixel text-blue">
            <span>{profile.current_xp} XP</span>
            <span>{requiredXp} XP (Next Lv: {profile.level + 1})</span>
          </div>
          <div className="h-2.5 w-full bg-black rounded-full overflow-hidden border border-black">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-[#FFB93D]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Stat Bars */}
          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-black">
            {STAT_ROWS.map(({ key, label, icon: Icon, color }, i) => {
              const value = profile[key];
              const pct = Math.min(100, (value / maxStat) * 100);
              return (
                <div key={key} className="flex items-center gap-2.5">
                  <Icon size={14} style={{ color }} aria-hidden="true" />
                  <span className="w-20 text-[10px] text-[#8CA6C4] shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-black">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
                    />
                  </div>
                  <span className="w-6 text-right text-[10px] font-pixel text-white">{value}</span>
                </div>
              );
            })}
          </div>
        </PixelPanel>

        {/* 2. Hero Hub Navigation Menu (Profile Sub-Routes) */}
        <div className="space-y-2">
          <h3 className="font-pixel text-[9px] text-gold flex items-center gap-1.5">
            <Sparkles size={12} /> Adventurer Portals
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="p-3 bg-[#0E1B2E] border border-[#38BDF8]/40 hover:border-gold rounded-pixel flex items-center justify-between transition-all active:scale-95 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-blue/15 text-blue">
                  <BarChart3 size={16} />
                </span>
                <div>
                  <span className="font-pixel text-[8px] text-white block">Analytics</span>
                  <span className="text-[8px] text-[#8CA6C4]">XP & Habits</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8CA6C4]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/achievements')}
              className="p-3 bg-[#0E1B2E] border border-gold/40 hover:border-gold rounded-pixel flex items-center justify-between transition-all active:scale-95 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-gold/15 text-gold">
                  <Trophy size={16} />
                </span>
                <div>
                  <span className="font-pixel text-[8px] text-white block">Achievements</span>
                  <span className="text-[8px] text-[#8CA6C4]">Hall of Fame</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8CA6C4]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/journal')}
              className="p-3 bg-[#0E1B2E] border border-[#B983FF]/40 hover:border-gold rounded-pixel flex items-center justify-between transition-all active:scale-95 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-[#B983FF]/15 text-[#B983FF]">
                  <BookOpen size={16} />
                </span>
                <div>
                  <span className="font-pixel text-[8px] text-white block">Journal</span>
                  <span className="text-[8px] text-[#8CA6C4]">Mood & Wisdom</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8CA6C4]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="p-3 bg-[#0E1B2E] border border-black hover:border-gold rounded-pixel flex items-center justify-between transition-all active:scale-95 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-white/10 text-white">
                  <SettingsIcon size={16} />
                </span>
                <div>
                  <span className="font-pixel text-[8px] text-white block">Settings</span>
                  <span className="text-[8px] text-[#8CA6C4]">Preferences</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8CA6C4]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="p-3 bg-[#0E1B2E] border border-black hover:border-gold rounded-pixel flex items-center justify-between transition-all active:scale-95 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-gold/15 text-gold">
                  <Store size={16} />
                </span>
                <div>
                  <span className="font-pixel text-[8px] text-white block">Shop</span>
                  <span className="text-[8px] text-[#8CA6C4]">Gear & Frames</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8CA6C4]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/leaderboard')}
              className="p-3 bg-[#0E1B2E] border border-black hover:border-gold rounded-pixel flex items-center justify-between transition-all active:scale-95 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-yellow-500/15 text-yellow-400">
                  <Trophy size={16} />
                </span>
                <div>
                  <span className="font-pixel text-[8px] text-white block">Leaderboard</span>
                  <span className="text-[8px] text-[#8CA6C4]">World Ranks</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8CA6C4]" />
            </button>
          </div>
        </div>

        {/* 3. Radar Chart */}
        <PixelPanel tone="blue" className="p-3 flex flex-col items-center">
          <RadarChart
            axes={STAT_ROWS.map((r) => ({ label: r.label, value: profile[r.key], color: r.color }))}
          />
          <p className="text-center text-[10px] italic text-[#8CA6C4] mt-1">
            &ldquo;A disciplined mind and forged body surmount all trials.&rdquo;
          </p>
        </PixelPanel>
      </div>

      <BottomNav />
    </div>
  );
};
