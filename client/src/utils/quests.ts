import { Dumbbell, BookOpen, Droplet, Brain, Sparkles, Wind, Heart } from 'lucide-react';
import type { QuestCategory, QuestType } from '@/types';

export const QUEST_TYPE_LABEL: Record<QuestType, string> = {
  MAIN: 'Main Quest',
  SIDE: 'Side Quest',
  MINI: 'Mini Quest',
};

export const QUEST_TYPE_TAB_LABEL: Record<QuestType, string> = {
  MAIN: 'Main',
  SIDE: 'Side',
  MINI: 'Mini',
};

export const CATEGORY_ICON: Record<QuestCategory, typeof Dumbbell> = {
  HEALTH: Heart,
  STRENGTH: Dumbbell,
  INTELLIGENCE: Brain,
  WISDOM: BookOpen,
  AGILITY: Wind,
};

export const CATEGORY_COLOR: Record<QuestCategory, string> = {
  HEALTH: '#FF4B4B',
  STRENGTH: '#FF9F4D',
  INTELLIGENCE: '#4DA6FF',
  WISDOM: '#B983FF',
  AGILITY: '#4CAF50',
};

// A generic "quest icon" per type, used on quest cards next to the title —
// distinct from the attribute-category icon shown for stat gains.
export const QUEST_TYPE_ICON: Record<QuestType, typeof Dumbbell> = {
  MAIN: Sparkles,
  SIDE: BookOpen,
  MINI: Droplet,
};
