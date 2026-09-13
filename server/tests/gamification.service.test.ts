import { describe, it, expect } from 'vitest';

import {
  getQuestReward,
  xpRequiredForLevel,
  calculateLevelFromXp,
  getXpProgress,
  calculateLevelAndCarryOverXp,
  calculateStreak,
} from '../src/services/gamification.service';

describe('Gamification Service', () => {
  describe('getQuestReward', () => {
    it('returns authoritative MAIN quest rewards', () => {
      expect(getQuestReward('MAIN')).toEqual({
        xp: 100,
        coins: 50,
        attributePoints: 3,
      });
    });

    it('returns authoritative SIDE quest rewards', () => {
      expect(getQuestReward('SIDE')).toEqual({
        xp: 60,
        coins: 30,
        attributePoints: 2,
      });
    });

    it('returns authoritative MINI quest rewards', () => {
      expect(getQuestReward('MINI')).toEqual({
        xp: 30,
        coins: 10,
        attributePoints: 1,
      });
    });

    it('rejects unsupported quest types', () => {
      expect(() => getQuestReward('INVALID')).toThrow(
        'Unsupported quest type',
      );
    });
  });

  describe('xpRequiredForLevel', () => {
    it('uses the authoritative XP formula', () => {
      expect(xpRequiredForLevel(1)).toBe(100);
      expect(xpRequiredForLevel(2)).toBe(282);
      expect(xpRequiredForLevel(3)).toBe(519);
    });

    it('rejects invalid levels', () => {
      expect(() => xpRequiredForLevel(0)).toThrow();
      expect(() => xpRequiredForLevel(-1)).toThrow();
    });
  });

  describe('calculateLevelFromXp', () => {
    it('keeps the same level when XP is insufficient', () => {
      expect(calculateLevelFromXp(1, 50)).toBe(1);
    });

    it('levels up when enough XP is earned', () => {
      expect(calculateLevelFromXp(1, 100)).toBe(2);
    });

    it('handles multiple level-ups', () => {
      expect(calculateLevelFromXp(1, 382)).toBe(3);
    });
  });

  describe('getXpProgress', () => {
    it('returns XP progress information', () => {
      expect(getXpProgress(1, 50)).toEqual({
        currentXp: 50,
        requiredXp: 100,
        progressPercent: 50,
      });
    });

    it('caps progress at 100 percent', () => {
      expect(getXpProgress(1, 150)).toEqual({
        currentXp: 150,
        requiredXp: 100,
        progressPercent: 100,
      });
    });
  });

  describe('calculateLevelAndCarryOverXp', () => {
    it('increases current XP without leveling up when threshold is not reached', () => {
      const result = calculateLevelAndCarryOverXp(1, 20, 30);
      expect(result).toEqual({
        level: 1,
        currentXp: 50,
        leveledUp: false,
      });
    });

    it('levels up with exact carry-over XP', () => {
      // Level 1 requires 100 XP. 80 + 50 = 130 XP -> Level 2 with 30 XP remaining.
      const result = calculateLevelAndCarryOverXp(1, 80, 50);
      expect(result).toEqual({
        level: 2,
        currentXp: 30,
        leveledUp: true,
      });
    });

    it('levels up to next level with 0 carry-over when exact XP matches', () => {
      const result = calculateLevelAndCarryOverXp(1, 0, 100);
      expect(result).toEqual({
        level: 2,
        currentXp: 0,
        leveledUp: true,
      });
    });

    it('handles multiple level-ups with carry-over XP correctly', () => {
      // Lv 1 requires 100, Lv 2 requires 282 (total 382 to reach Lv 3).
      // If player earns 400 XP at Lv 1 with 0 XP:
      // Lv 1 -> Lv 2 (300 remaining) -> Lv 3 (300 - 282 = 18 remaining).
      const result = calculateLevelAndCarryOverXp(1, 0, 400);
      expect(result).toEqual({
        level: 3,
        currentXp: 18,
        leveledUp: true,
      });
    });
  });

  describe('calculateStreak', () => {
    const today = '2026-09-13';

    it('starts streak at 1 on first quest completion ever', () => {
      const result = calculateStreak(null, 0, 0, today);
      expect(result).toEqual({
        currentStreak: 1,
        longestStreak: 1,
        lastCompletionDate: today,
        isNewDayCompletion: true,
      });
    });

    it('increments streak when completed on consecutive day (yesterday)', () => {
      const result = calculateStreak('2026-09-12', 4, 10, today);
      expect(result).toEqual({
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: today,
        isNewDayCompletion: true,
      });
    });

    it('updates longest streak when current exceeds it', () => {
      const result = calculateStreak('2026-09-12', 10, 10, today);
      expect(result).toEqual({
        currentStreak: 11,
        longestStreak: 11,
        lastCompletionDate: today,
        isNewDayCompletion: true,
      });
    });

    it('does not increment streak on multiple completions same day', () => {
      const result = calculateStreak(today, 3, 5, today);
      expect(result).toEqual({
        currentStreak: 3,
        longestStreak: 5,
        lastCompletionDate: today,
        isNewDayCompletion: false,
      });
    });

    it('resets streak to 1 when a day was missed (more than 1 day ago)', () => {
      const result = calculateStreak('2026-09-10', 8, 15, today);
      expect(result).toEqual({
        currentStreak: 1,
        longestStreak: 15,
        lastCompletionDate: today,
        isNewDayCompletion: true,
      });
    });
  });
});