import { describe, it, expect } from 'vitest';

import {
  getQuestReward,
  xpRequiredForLevel,
  calculateLevelFromXp,
  getXpProgress,
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
});