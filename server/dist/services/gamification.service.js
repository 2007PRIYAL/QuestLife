"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStreak = exports.calculateLevelAndCarryOverXp = exports.normalizeDateString = exports.getYesterdayDate = exports.getDateInTimezone = exports.getXpProgress = exports.calculateLevelFromXp = exports.xpRequiredForLevel = exports.getQuestReward = void 0;
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
/**
 * Returns YYYY-MM-DD in the given IANA timezone.
 */
const getDateInTimezone = (timezone = 'UTC', date = new Date()) => {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return formatter.format(date);
    }
    catch {
        return date.toISOString().slice(0, 10);
    }
};
exports.getDateInTimezone = getDateInTimezone;
/**
 * Returns previous calendar day (YYYY-MM-DD) given a YYYY-MM-DD date string.
 */
const getYesterdayDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
};
exports.getYesterdayDate = getYesterdayDate;
const normalizeDateString = (date) => {
    if (!date)
        return null;
    if (date instanceof Date) {
        return date.toISOString().slice(0, 10);
    }
    return String(date).slice(0, 10);
};
exports.normalizeDateString = normalizeDateString;
/**
 * Calculates the resulting level and carry-over XP after gaining XP.
 */
const calculateLevelAndCarryOverXp = (currentLevel, currentXp, xpEarned) => {
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
    while (xp >= (0, exports.xpRequiredForLevel)(level)) {
        xp -= (0, exports.xpRequiredForLevel)(level);
        level += 1;
    }
    return {
        level,
        currentXp: xp,
        leveledUp: level > currentLevel,
    };
};
exports.calculateLevelAndCarryOverXp = calculateLevelAndCarryOverXp;
/**
 * Calculates the updated streak based on last completion date and current date in user timezone.
 */
const calculateStreak = (lastCompletionDate, currentStreak, longestStreak, today) => {
    const normalizedLast = (0, exports.normalizeDateString)(lastCompletionDate);
    const yesterday = (0, exports.getYesterdayDate)(today);
    let newStreak = currentStreak;
    let isNewDayCompletion = false;
    if (!normalizedLast) {
        newStreak = 1;
        isNewDayCompletion = true;
    }
    else if (normalizedLast === today) {
        newStreak = Math.max(1, currentStreak);
        isNewDayCompletion = false;
    }
    else if (normalizedLast === yesterday) {
        newStreak = currentStreak + 1;
        isNewDayCompletion = true;
    }
    else {
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
exports.calculateStreak = calculateStreak;
