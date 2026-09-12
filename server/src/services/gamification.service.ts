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