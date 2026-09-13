export interface QuestReward {
  xp: number;
  coins: number;
  attributePoints: number;
}

const REWARDS: Record<string, QuestReward> = {
  MAIN: {
    xp: 100,
    coins: 50,
    attributePoints: 3,
  },
  SIDE: {
    xp: 60,
    coins: 30,
    attributePoints: 2,
  },
  MINI: {
    xp: 30,
    coins: 10,
    attributePoints: 1,
  },
};

/**
 * Server-authoritative quest rewards.
 * Clients must never be allowed to provide reward values.
 */
export const getQuestReward = (questType: string): QuestReward => {
  const reward = REWARDS[questType];

  if (!reward) {
    throw new Error(`Unsupported quest type: ${questType}`);
  }

  return { ...reward };
};

/**
 * XP required to reach the next level.
 * Formula: floor(100 * L^1.5)
 */
export const xpRequiredForLevel = (level: number): number => {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('Level must be a positive integer');
  }

  return Math.floor(100 * Math.pow(level, 1.5));
};

/**
 * Calculates the resulting level after adding XP.
 */
export const calculateLevelFromXp = (
  currentLevel: number,
  currentXp: number,
): number => {
  if (!Number.isInteger(currentLevel) || currentLevel < 1) {
    throw new Error('Current level must be a positive integer');
  }

  if (!Number.isFinite(currentXp) || currentXp < 0) {
    throw new Error('Current XP must be a non-negative number');
  }

  let level = currentLevel;
  let xp = currentXp;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level += 1;
  }

  return level;
};

export const getXpProgress = (
  level: number,
  currentXp: number,
): {
  currentXp: number;
  requiredXp: number;
  progressPercent: number;
} => {
  const requiredXp = xpRequiredForLevel(level);

  const progressPercent = Math.min(
    100,
    Math.floor((currentXp / requiredXp) * 100),
  );

  return {
    currentXp,
    requiredXp,
    progressPercent,
  };
};

/**
 * Returns YYYY-MM-DD in the given IANA timezone.
 */
export const getDateInTimezone = (
  timezone: string = 'UTC',
  date: Date = new Date(),
): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
};

/**
 * Returns previous calendar day (YYYY-MM-DD) given a YYYY-MM-DD date string.
 */
export const getYesterdayDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const normalizeDateString = (
  date: string | Date | null | undefined,
): string | null => {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  return String(date).slice(0, 10);
};

export interface LevelProgressionResult {
  level: number;
  currentXp: number;
  leveledUp: boolean;
}

/**
 * Calculates the resulting level and carry-over XP after gaining XP.
 */
export const calculateLevelAndCarryOverXp = (
  currentLevel: number,
  currentXp: number,
  xpEarned: number,
): LevelProgressionResult => {
  if (!Number.isInteger(currentLevel) || currentLevel < 1) {
    throw new Error('Current level must be a positive integer');
  }
  if (!Number.isFinite(currentXp) || currentXp < 0) {
    throw new Error('Current XP must be a non-negative number');
  }
  if (!Number.isFinite(xpEarned) || xpEarned < 0) {
    throw new Error('XP earned must be a non-negative number');
  }

  let level = currentLevel;
  let xp = currentXp + xpEarned;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level += 1;
  }

  return {
    level,
    currentXp: xp,
    leveledUp: level > currentLevel,
  };
};

export interface StreakUpdateResult {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string;
  isNewDayCompletion: boolean;
}

/**
 * Calculates the updated streak based on last completion date and current date in user timezone.
 */
export const calculateStreak = (
  lastCompletionDate: string | Date | null | undefined,
  currentStreak: number,
  longestStreak: number,
  today: string,
): StreakUpdateResult => {
  const normalizedLast = normalizeDateString(lastCompletionDate);
  const yesterday = getYesterdayDate(today);

  let newStreak = currentStreak;
  let isNewDayCompletion = false;

  if (!normalizedLast) {
    newStreak = 1;
    isNewDayCompletion = true;
  } else if (normalizedLast === today) {
    newStreak = Math.max(1, currentStreak);
    isNewDayCompletion = false;
  } else if (normalizedLast === yesterday) {
    newStreak = currentStreak + 1;
    isNewDayCompletion = true;
  } else {
    // Streak broken because last completion was before yesterday
    newStreak = 1;
    isNewDayCompletion = true;
  }

  const newLongestStreak = Math.max(longestStreak, newStreak);

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastCompletionDate: today,
    isNewDayCompletion,
  };
};