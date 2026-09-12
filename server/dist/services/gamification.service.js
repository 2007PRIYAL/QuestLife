"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXpProgress = exports.calculateLevelFromXp = exports.xpRequiredForLevel = exports.getQuestReward = void 0;
const REWARDS = {
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
const getQuestReward = (questType) => {
    const reward = REWARDS[questType];
    if (!reward) {
        throw new Error(`Unsupported quest type: ${questType}`);
    }
    return { ...reward };
};
exports.getQuestReward = getQuestReward;
/**
 * XP required to reach the next level.
 * Formula: floor(100 * L^1.5)
 */
const xpRequiredForLevel = (level) => {
    if (!Number.isInteger(level) || level < 1) {
        throw new Error('Level must be a positive integer');
    }
    return Math.floor(100 * Math.pow(level, 1.5));
};
exports.xpRequiredForLevel = xpRequiredForLevel;
/**
 * Calculates the resulting level after adding XP.
 */
const calculateLevelFromXp = (currentLevel, currentXp) => {
    if (!Number.isInteger(currentLevel) || currentLevel < 1) {
        throw new Error('Current level must be a positive integer');
    }
    if (!Number.isFinite(currentXp) || currentXp < 0) {
        throw new Error('Current XP must be a non-negative number');
    }
    let level = currentLevel;
    let xp = currentXp;
    while (xp >= (0, exports.xpRequiredForLevel)(level)) {
        xp -= (0, exports.xpRequiredForLevel)(level);
        level += 1;
    }
    return level;
};
exports.calculateLevelFromXp = calculateLevelFromXp;
const getXpProgress = (level, currentXp) => {
    const requiredXp = (0, exports.xpRequiredForLevel)(level);
    const progressPercent = Math.min(100, Math.floor((currentXp / requiredXp) * 100));
    return {
        currentXp,
        requiredXp,
        progressPercent,
    };
};
exports.getXpProgress = getXpProgress;
