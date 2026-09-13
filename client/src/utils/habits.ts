// Local habit tracking layer for Water, Sleep, Focus study, and Daily Reward Chest.
// All keys are namespaced with questlife_v2_ for clean multi-session storage.

export const WATER_GOAL_ML = 2000;

export interface SleepData {
  bedtime: string; // "23:00"
  wakeTime: string; // "07:00"
  lastCheckinDate?: string;
  sleepStreak: number;
}

export interface ChestReward {
  coins: number;
  xp: number;
  attribute: 'Health' | 'Strength' | 'Intelligence' | 'Wisdom' | 'Agility';
  attributePoints: number;
}

const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// ==========================================
// 1. WATER TRACKER
// ==========================================
export const getTodayWaterIntake = (): number => {
  try {
    const key = `questlife_v2_water_${getTodayKey()}`;
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

export const addWaterIntake = (amountMl: number): { currentMl: number; goalReached: boolean } => {
  const current = getTodayWaterIntake();
  const next = Math.max(0, current + amountMl);
  try {
    localStorage.setItem(`questlife_v2_water_${getTodayKey()}`, next.toString());
  } catch {}
  return {
    currentMl: next,
    goalReached: next >= WATER_GOAL_ML,
  };
};

export const isWaterGoalClaimedToday = (): boolean => {
  try {
    return localStorage.getItem(`questlife_v2_water_claimed_${getTodayKey()}`) === 'true';
  } catch {
    return false;
  }
};

export const setWaterGoalClaimedToday = (): void => {
  try {
    localStorage.setItem(`questlife_v2_water_claimed_${getTodayKey()}`, 'true');
  } catch {}
};

// ==========================================
// 2. SLEEP TRACKER
// ==========================================
const SLEEP_KEY = 'questlife_v2_sleep_data';

export const getSleepData = (): SleepData => {
  try {
    const raw = localStorage.getItem(SLEEP_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    bedtime: '23:00',
    wakeTime: '07:00',
    sleepStreak: 0,
  };
};

export const saveSleepSchedule = (bedtime: string, wakeTime: string): void => {
  const current = getSleepData();
  const updated: SleepData = {
    ...current,
    bedtime,
    wakeTime,
  };
  try {
    localStorage.setItem(SLEEP_KEY, JSON.stringify(updated));
  } catch {}
};

export const canCheckInSleepToday = (): boolean => {
  const data = getSleepData();
  const today = getTodayKey();
  return data.lastCheckinDate !== today;
};

export const checkInSleepToday = (): { success: boolean; streak: number } => {
  const data = getSleepData();
  const today = getTodayKey();

  if (data.lastCheckinDate === today) {
    return { success: false, streak: data.sleepStreak };
  }

  // Calculate if yesterday was checked in to maintain streak
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const nextStreak = data.lastCheckinDate === yesterday ? data.sleepStreak + 1 : 1;

  const updated: SleepData = {
    ...data,
    lastCheckinDate: today,
    sleepStreak: nextStreak,
  };

  try {
    localStorage.setItem(SLEEP_KEY, JSON.stringify(updated));
  } catch {}

  return { success: true, streak: nextStreak };
};

// ==========================================
// 3. DAILY REWARD CHEST
// ==========================================
const CHEST_KEY = 'questlife_v2_chest_last_claimed';
const CHEST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getChestCooldownSeconds = (): number => {
  try {
    const raw = localStorage.getItem(CHEST_KEY);
    if (!raw) return 0;
    const lastClaim = parseInt(raw, 10);
    const elapsed = Date.now() - lastClaim;
    const remainingMs = CHEST_COOLDOWN_MS - elapsed;
    return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;
  } catch {
    return 0;
  }
};

export const canOpenChest = (): boolean => {
  return getChestCooldownSeconds() === 0;
};

export const claimDailyChest = (): ChestReward | null => {
  if (!canOpenChest()) return null;

  try {
    localStorage.setItem(CHEST_KEY, Date.now().toString());
  } catch {}

  const attributes: ('Health' | 'Strength' | 'Intelligence' | 'Wisdom' | 'Agility')[] = [
    'Health',
    'Strength',
    'Intelligence',
    'Wisdom',
    'Agility',
  ];
  const randomAttr = attributes[Math.floor(Math.random() * attributes.length)];

  // Generates generous daily login bounty
  return {
    coins: 75,
    xp: 50,
    attribute: randomAttr,
    attributePoints: 1,
  };
};

// ==========================================
// 4. FOCUS STUDY SESSIONS
// ==========================================
const FOCUS_KEY = 'questlife_v2_focus_history';

export interface FocusSession {
  date: string; // YYYY-MM-DD
  minutes: number;
  questTitle?: string;
}

export const logFocusSession = (minutes: number, questTitle?: string): void => {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    const sessions: FocusSession[] = raw ? JSON.parse(raw) : [];
    sessions.push({
      date: getTodayKey(),
      minutes,
      questTitle,
    });
    localStorage.setItem(FOCUS_KEY, JSON.stringify(sessions));
  } catch {}
};

export const getWeeklyFocusMinutes = (): number => {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    if (!raw) return 0;
    const sessions: FocusSession[] = JSON.parse(raw);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    return sessions
      .filter((s) => s.date >= sevenDaysAgo)
      .reduce((acc, s) => acc + s.minutes, 0);
  } catch {
    return 0;
  }
};
