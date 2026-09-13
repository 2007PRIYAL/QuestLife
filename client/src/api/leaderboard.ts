import type { Profile } from '@/types';

/**
 * IMPORTANT: the provided backend has no leaderboard route, controller, or
 * service — there's no way to list or rank other users at all. See
 * NOTES.md for what a `GET /api/leaderboard` response would need to look
 * like to plug in here.
 *
 * This returns local sample data so the Leaderboard screen is fully built
 * and navigable, but it is clearly NOT live data. Swap the body of this
 * function for a real `apiClient.get('/leaderboard')` call once that
 * endpoint exists — everything downstream (LeaderboardPage) already
 * consumes this exact shape.
 */
export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
  avatar_url: string | null;
  is_you?: boolean;
}

const SAMPLE_LEADERBOARD: Omit<LeaderboardEntry, 'is_you'>[] = [
  { rank: 1, username: 'Aarav', xp: 12540, level: 14, avatar_url: null },
  { rank: 2, username: 'Zoya', xp: 11320, level: 13, avatar_url: null },
  { rank: 3, username: 'Karan', xp: 10980, level: 13, avatar_url: null },
  { rank: 4, username: 'Priya', xp: 9450, level: 12, avatar_url: null },
  { rank: 5, username: 'Rohan', xp: 8760, level: 11, avatar_url: null },
  { rank: 7, username: 'Sneha', xp: 7980, level: 10, avatar_url: null },
  { rank: 8, username: 'Arjun', xp: 7540, level: 10, avatar_url: null },
];

export const fetchLeaderboard = async (
  currentUser: { username: string; profile: Profile },
): Promise<LeaderboardEntry[]> => {
  const you: LeaderboardEntry = {
    rank: 6,
    username: currentUser.username,
    xp: currentUser.profile.current_xp,
    level: currentUser.profile.level,
    avatar_url: currentUser.profile.avatar_url,
    is_you: true,
  };

  return [...SAMPLE_LEADERBOARD, you].sort((a, b) => b.xp - a.xp);
};
