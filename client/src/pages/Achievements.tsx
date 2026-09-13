import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Lock,
  Sparkles,
  BookOpen,
  Heart,
  Dumbbell,
  Brain,
  Wind,
  Flame,
  CheckCircle2,
  Timer,
  Moon,
  Droplet,
  Shield,
  Zap,
} from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { fetchProfile } from '@/api/profile';
import {
  evaluateAchievements,
  AchievementCategory,
  Achievement,
} from '@/utils/achievements';
import type { Profile } from '@/types';

const ICON_MAP: Record<string, typeof Trophy> = {
  BookOpen,
  Timer,
  Brain,
  Droplet,
  Moon,
  Heart,
  Dumbbell,
  Shield,
  Sparkles,
  ScrollText: BookOpen,
  Wind,
  Zap,
  Flame,
  Trophy,
};

const CATEGORIES: (AchievementCategory | 'All')[] = [
  'All',
  'Study',
  'Health',
  'Strength',
  'Wisdom',
  'Agility',
  'Streak',
];

export const Achievements = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const p = await fetchProfile();
        setProfile(p);
      } catch {
        setError('Could not load achievement records.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const achievements = useMemo(() => {
    return evaluateAchievements(profile, profile?.current_streak || 0);
  }, [profile]);

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'All') return achievements;
    return achievements.filter((a) => a.category === selectedCategory);
  }, [achievements, selectedCategory]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Unsealing the Hall of Achievements..." />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      {error && (
        <div className="p-3">
          <ErrorBanner message={error} />
        </div>
      )}

      <main className="flex-1 px-4 py-3.5 space-y-4 pb-8 overflow-y-auto">
        {/* Header & Trophy Summary */}
        <div className="pixel-border bg-[#0E1B2E] p-3.5 rounded-pixel flex items-center justify-between">
          <div>
            <p className="font-pixel text-[7px] text-blue mb-0.5">HERO HALL OF GLORY</p>
            <h1 className="font-pixel text-[13px] text-gold text-shadow-pixel">Achievements</h1>
            <p className="text-[10px] text-[#8CA6C4] mt-0.5">
              Derived from your real stats, quests, and discipline.
            </p>
          </div>
          <div className="text-right">
            <span className="font-pixel text-lg text-gold block">
              {unlockedCount}/{achievements.length}
            </span>
            <span className="font-pixel text-[7px] text-blue">Unlocked</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'px-2.5 py-1 font-pixel text-[7px] rounded whitespace-nowrap transition-colors border cursor-pointer',
                  isSelected
                    ? 'border-gold bg-gold text-[#3A2400] font-bold shadow-glow'
                    : 'border-[#1E293B] bg-[#14233D] text-[#8CA6C4] hover:text-white',
                ].join(' ')}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Badges List */}
        <div className="space-y-2.5">
          {filteredAchievements.map((item) => {
            const Icon = ICON_MAP[item.iconName] || Trophy;
            const progressPercent = Math.min(
              100,
              Math.floor((item.current / item.target) * 100),
            );

            return (
              <div
                key={item.id}
                className={[
                  'p-3 rounded-pixel border-2 transition-all flex items-start gap-3',
                  item.isUnlocked
                    ? 'border-gold/60 bg-[#0E1B2E] shadow-glow'
                    : 'border-black bg-[#0A121E] opacity-70',
                ].join(' ')}
              >
                {/* Badge Icon Frame */}
                <div
                  className={[
                    'w-11 h-11 rounded-pixel flex items-center justify-center shrink-0 border-2 border-black',
                    item.isUnlocked
                      ? 'bg-gradient-to-br from-gold/30 to-[#B45309]/30 text-gold shadow-[0_0_10px_rgba(255,215,0,0.4)]'
                      : 'bg-[#14233D] text-[#5C7A9E]',
                  ].join(' ')}
                >
                  {item.isUnlocked ? <Icon size={22} /> : <Lock size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3
                      className={[
                        'font-pixel text-[9px] truncate',
                        item.isUnlocked ? 'text-gold' : 'text-[#8CA6C4]',
                      ].join(' ')}
                    >
                      {item.title}
                    </h3>
                    <span className="font-pixel text-[6px] text-blue shrink-0">
                      +{item.rewardCoins} Coins
                    </span>
                  </div>

                  <p className="text-[9px] text-[#A0B7D0] leading-tight mb-2">
                    {item.description}
                  </p>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between font-pixel text-[6px] text-[#8CA6C4] mb-1">
                      <span>{item.category}</span>
                      <span>
                        {item.current} / {item.target} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-black">
                      <motion.div
                        className={[
                          'h-full',
                          item.isUnlocked
                            ? 'bg-gradient-to-r from-gold to-[#4CAF50]'
                            : 'bg-[#38BDF8]',
                        ].join(' ')}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
