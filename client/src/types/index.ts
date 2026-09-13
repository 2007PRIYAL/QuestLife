// These types mirror the ACTUAL shapes returned by the existing backend
// (see server/src/services/*.ts and server/migrations/001_initial_schema.sql).
// Do not add fields here that the backend doesn't actually return.

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: { path: (string | number)[]; message: string }[];
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface RegisterLoginResult {
  user: AuthUser;
  token: string;
}

export interface Profile {
  user_id: string;
  level: number;
  current_xp: number;
  coins: number;
  health: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  agility: number;
  avatar_url: string | null;
  equipped_frame: string;
  timezone: string;
  total_quests_completed: number;
  current_streak: number;
  longest_streak: number;
  last_completion_date: string | null;
}

export interface CurrentUser extends AuthUser {
  profile: Omit<Profile, 'current_streak' | 'longest_streak' | 'last_completion_date' | 'user_id'>;
  streak: {
    current_streak: number;
    longest_streak: number;
    last_completion_date: string | null;
  };
}

export type QuestType = 'MAIN' | 'SIDE' | 'MINI';

export type QuestCategory =
  | 'HEALTH'
  | 'STRENGTH'
  | 'INTELLIGENCE'
  | 'WISDOM'
  | 'AGILITY';

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: QuestType;
  category: QuestCategory;
  base_xp: number;
  base_coins: number;
  attribute_points: number;
  map_index: number | null;
  is_recurring: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Client-only, derived from local completion tracking (see NOTES.md —
  // the backend has no completion endpoint yet).
  completed_today?: boolean;
}

export interface CreateQuestInput {
  title: string;
  description?: string;
  type: QuestType;
  category: QuestCategory;
  map_index?: number;
  is_recurring?: boolean;
}

export interface QuestRewardResult {
  quest: Quest;
  xp_awarded: number;
  coins_awarded: number;
  attribute_points_awarded: number;
  attribute_category: QuestCategory;
  leveled_up: boolean;
  new_level: number;
  current_streak?: number;
}
