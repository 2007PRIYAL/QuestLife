import type { Profile } from '@/types';
import { getTodayWaterIntake, getSleepData, getWeeklyFocusMinutes } from './habits';

export type AchievementCategory = 'Study' | 'Health' | 'Strength' | 'Wisdom' | 'Agility' | 'Streak';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  target: number;
  current: number;
  isUnlocked: boolean;
  iconName: string;
  rewardCoins: number;
}

export const evaluateAchievements = (
  profile: Profile | null,
  streakCount: number = 0,
): Achievement[] => {
  const p = profile || {
    level: 1,
    health: 10,
    strength: 10,
    intelligence: 10,
    wisdom: 10,
    agility: 10,
    total_quests_completed: 0,
    coins: 0,
  };

  const waterMl = getTodayWaterIntake();
  const sleepData = getSleepData();
  const focusMinutes = getWeeklyFocusMinutes();

  const achievements: Achievement[] = [
    // 1. STUDY / INTELLECT
    {
      id: 'study-1',
      category: 'Study',
      title: 'Novice Scholar',
      description: 'Reach 15 Intelligence through mental quests.',
      target: 15,
      current: Math.min(15, p.intelligence),
      isUnlocked: p.intelligence >= 15,
      iconName: 'BookOpen',
      rewardCoins: 50,
    },
    {
      id: 'study-2',
      category: 'Study',
      title: 'Deep Focus Master',
      description: 'Complete at least 50 minutes of focused study time.',
      target: 50,
      current: Math.min(50, focusMinutes),
      isUnlocked: focusMinutes >= 50,
      iconName: 'Timer',
      rewardCoins: 80,
    },
    {
      id: 'study-3',
      category: 'Study',
      title: 'Archmage of Code',
      description: 'Reach 25 Intelligence through intellectual mastery.',
      target: 25,
      current: Math.min(25, p.intelligence),
      isUnlocked: p.intelligence >= 25,
      iconName: 'Brain',
      rewardCoins: 150,
    },

    // 2. HEALTH / VITALITY
    {
      id: 'health-1',
      category: 'Health',
      title: 'Hydrated Hero',
      description: 'Drink 2,000 ml of water in a single day.',
      target: 2000,
      current: Math.min(2000, waterMl),
      isUnlocked: waterMl >= 2000,
      iconName: 'Droplet',
      rewardCoins: 50,
    },
    {
      id: 'health-2',
      category: 'Health',
      title: 'Dream Walker',
      description: 'Maintain a restful sleep streak of 3 consecutive nights.',
      target: 3,
      current: Math.min(3, sleepData.sleepStreak),
      isUnlocked: sleepData.sleepStreak >= 3,
      iconName: 'Moon',
      rewardCoins: 100,
    },
    {
      id: 'health-3',
      category: 'Health',
      title: 'Immortal Vitality',
      description: 'Elevate your Health attribute to 20 or higher.',
      target: 20,
      current: Math.min(20, p.health),
      isUnlocked: p.health >= 20,
      iconName: 'Heart',
      rewardCoins: 120,
    },

    // 3. STRENGTH
    {
      id: 'strength-1',
      category: 'Strength',
      title: 'Iron Warrior',
      description: 'Forge 15 Strength through consistent physical quests.',
      target: 15,
      current: Math.min(15, p.strength),
      isUnlocked: p.strength >= 15,
      iconName: 'Dumbbell',
      rewardCoins: 50,
    },
    {
      id: 'strength-2',
      category: 'Strength',
      title: 'Titan of Discipline',
      description: 'Push your Strength attribute to 25.',
      target: 25,
      current: Math.min(25, p.strength),
      isUnlocked: p.strength >= 25,
      iconName: 'Shield',
      rewardCoins: 150,
    },

    // 4. WISDOM
    {
      id: 'wisdom-1',
      category: 'Wisdom',
      title: 'Philosopher Adventurer',
      description: 'Attain 15 Wisdom through reflection and mindfulness.',
      target: 15,
      current: Math.min(15, p.wisdom),
      isUnlocked: p.wisdom >= 15,
      iconName: 'Sparkles',
      rewardCoins: 50,
    },
    {
      id: 'wisdom-2',
      category: 'Wisdom',
      title: 'Sage of Reflection',
      description: 'Reach 25 Wisdom to unlock profound insight.',
      target: 25,
      current: Math.min(25, p.wisdom),
      isUnlocked: p.wisdom >= 25,
      iconName: 'ScrollText',
      rewardCoins: 150,
    },

    // 5. AGILITY
    {
      id: 'agility-1',
      category: 'Agility',
      title: 'Swift Ranger',
      description: 'Reach 15 Agility with rapid movement and speed.',
      target: 15,
      current: Math.min(15, p.agility),
      isUnlocked: p.agility >= 15,
      iconName: 'Wind',
      rewardCoins: 50,
    },
    {
      id: 'agility-2',
      category: 'Agility',
      title: 'Wind Walker',
      description: 'Reach 25 Agility to dance past all obstacles.',
      target: 25,
      current: Math.min(25, p.agility),
      isUnlocked: p.agility >= 25,
      iconName: 'Zap',
      rewardCoins: 150,
    },

    // 6. STREAK & LEVEL
    {
      id: 'streak-1',
      category: 'Streak',
      title: 'Consistent Blade',
      description: 'Maintain a 3-day quest streak without faltering.',
      target: 3,
      current: Math.min(3, streakCount),
      isUnlocked: streakCount >= 3,
      iconName: 'Flame',
      rewardCoins: 60,
    },
    {
      id: 'streak-2',
      category: 'Streak',
      title: 'Unbroken Will',
      description: 'Achieve a 7-day quest streak.',
      target: 7,
      current: Math.min(7, streakCount),
      isUnlocked: streakCount >= 7,
      iconName: 'Flame',
      rewardCoins: 120,
    },
    {
      id: 'streak-3',
      category: 'Streak',
      title: 'Legendary Hero',
      description: 'Advance your Hero to Level 10.',
      target: 10,
      current: Math.min(10, p.level),
      isUnlocked: p.level >= 10,
      iconName: 'Trophy',
      rewardCoins: 200,
    },
  ];

  return achievements;
};
