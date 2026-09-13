// Mirrors server/src/services/gamification.service.ts exactly, so the UI's
// XP bar math matches what the backend would compute. Kept read-only /
// display-only on the client — the server remains authoritative.

// XP required to reach the next level. Formula: floor(100 * L^1.5)
export const xpRequiredForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export const getXpProgress = (level: number, currentXp: number) => {
  const requiredXp = xpRequiredForLevel(level);
  const progressPercent = Math.min(100, Math.floor((currentXp / requiredXp) * 100));
  return { currentXp, requiredXp, progressPercent };
};
