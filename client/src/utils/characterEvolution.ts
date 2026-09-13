// Character Evolution system based on user level.
// Levels 1–5: Basic Hero (Novice)
// Levels 6–10: Bronze Armor (Seasoned)
// Levels 11–15: Golden Cape (Champion)
// Levels 16–20: Knight Armor (Knight-Commander)
// Levels 21+: Legendary Hero (Mythic)

export interface CharacterEvolution {
  tier: number;
  rankTitle: string;
  badgeLabel: string;
  borderClass: string;
  glowClass: string;
  badgeBg: string;
  minLevel: number;
  maxLevel: number;
  nextTierLevel: number | null;
}

export const getCharacterEvolution = (level: number): CharacterEvolution => {
  if (level >= 21) {
    return {
      tier: 5,
      rankTitle: 'Mythic Hero',
      badgeLabel: 'Legendary',
      borderClass: 'border-2 border-[#E0A96D] shadow-[0_0_12px_rgba(224,169,109,0.7)]',
      glowClass: 'shadow-[0_0_15px_rgba(255,215,0,0.6)]',
      badgeBg: 'bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] text-black',
      minLevel: 21,
      maxLevel: 99,
      nextTierLevel: null,
    };
  }

  if (level >= 16) {
    return {
      tier: 4,
      rankTitle: 'Knight-Commander',
      badgeLabel: 'Knight Armor',
      borderClass: 'border-2 border-[#A0AEC0] shadow-[0_0_10px_rgba(160,174,192,0.5)]',
      glowClass: 'shadow-[0_0_12px_rgba(192,192,192,0.5)]',
      badgeBg: 'bg-gradient-to-r from-[#94A3B8] to-[#CBD5E1] text-[#0F172A]',
      minLevel: 16,
      maxLevel: 20,
      nextTierLevel: 21,
    };
  }

  if (level >= 11) {
    return {
      tier: 3,
      rankTitle: 'Champion Adventurer',
      badgeLabel: 'Golden Cape',
      borderClass: 'border-2 border-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      glowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      badgeBg: 'bg-gradient-to-r from-[#F59E0B] to-[#FCD34D] text-[#451A03]',
      minLevel: 11,
      maxLevel: 15,
      nextTierLevel: 16,
    };
  }

  if (level >= 6) {
    return {
      tier: 2,
      rankTitle: 'Seasoned Explorer',
      badgeLabel: 'Bronze Armor',
      borderClass: 'border-2 border-[#CD7F32] shadow-[0_0_6px_rgba(205,127,50,0.4)]',
      glowClass: 'shadow-[0_0_8px_rgba(205,127,50,0.4)]',
      badgeBg: 'bg-[#854D0E] text-[#FEF3C7]',
      minLevel: 6,
      maxLevel: 10,
      nextTierLevel: 11,
    };
  }

  return {
    tier: 1,
    rankTitle: 'Novice Adventurer',
    badgeLabel: 'Basic Hero',
    borderClass: 'border-2 border-[#334155]',
    glowClass: '',
    badgeBg: 'bg-[#1E293B] text-[#94A3B8]',
    minLevel: 1,
    maxLevel: 5,
    nextTierLevel: 6,
  };
};
