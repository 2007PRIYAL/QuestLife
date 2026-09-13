import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { PixelPanel } from '@/components/PixelPanel';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { fetchProfile } from '@/api/profile';
import { fetchLeaderboard } from '@/api/leaderboard';
import type { LeaderboardEntry } from '@/api/leaderboard';
import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { Profile } from '@/types';

type Scope = 'GLOBAL' | 'FRIENDS' | 'SEASON';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'GLOBAL', label: 'Global' },
  { key: 'FRIENDS', label: 'Friends' },
  { key: 'SEASON', label: 'This Season' },
];

const PODIUM_COLORS = ['#FFD93D', '#C9CDD6', '#CD7F32'];

export const Leaderboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [scope, setScope] = useState<Scope>('GLOBAL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profileData = await fetchProfile();
        if (cancelled) return;
        setProfile(profileData);
        if (user) {
          const board = await fetchLeaderboard({ username: user.username, profile: profileData });
          if (!cancelled) setEntries(board);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load the leaderboard.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Tallying the season's heroes..." />
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      <div className="px-4 pt-4 pb-2">
        <h1 className="font-pixel text-[14px] text-gold text-shadow-pixel">Leaderboard</h1>
        <p className="text-xs text-[#8CA6C4] mt-1">Real Heroes. Real Progress.</p>
      </div>

      <div className="flex gap-2 px-4 pb-3">
        {SCOPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setScope(key)}
            className={[
              'font-pixel text-[8px] px-3 py-2 rounded-pixel border-2 border-black flex-1',
              scope === key ? 'bg-gold text-[#3A2400]' : 'bg-[#0E1B2E] text-[#8CA6C4]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col gap-4 overflow-y-auto">
        {error && <ErrorBanner message={error} />}
        {scope !== 'GLOBAL' && (
          <p className="text-center text-xs text-[#5C7A9E] italic">
            {scope === 'FRIENDS' ? 'Friends lists aren\u2019t available yet.' : 'Season history isn\u2019t available yet.'}{' '}
            Showing global standings.
          </p>
        )}

        {top3.length === 3 && (
          <div className="flex items-end justify-center gap-3 pt-2">
            {[top3[1], top3[0], top3[2]].map((entry, visualIndex) => {
              const podiumHeight = visualIndex === 1 ? 'h-24' : 'h-16';
              const color = PODIUM_COLORS[visualIndex === 1 ? 0 : visualIndex === 0 ? 1 : 2];
              return (
                <motion.div
                  key={entry.rank}
                  className="flex flex-col items-center w-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + visualIndex * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {entry.rank === 1 && <Crown size={18} className="text-gold mb-1" aria-hidden="true" />}
                  <div
                    className="w-12 h-12 rounded-pixel border-2 border-black flex items-center justify-center text-lg mb-2"
                    style={{ backgroundColor: color }}
                  >
                    🧑
                  </div>
                  <p className="text-xs text-white font-semibold truncate w-full text-center">{entry.username}</p>
                  <p className="text-[10px] text-[#8CA6C4] mb-2">{entry.xp.toLocaleString()} XP</p>
                  <div
                    className={`w-full ${podiumHeight} rounded-t-pixel border-2 border-black flex items-start justify-center pt-1`}
                    style={{ backgroundColor: color }}
                  >
                    <span className="font-pixel text-[11px] text-[#1a1a1a]">{entry.rank}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <PixelPanel tone="blue" className="divide-y divide-[#0E1B2E]">
          {rest.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={[
                'flex items-center gap-3 px-4 py-3',
                entry.is_you ? 'bg-gold/10' : '',
              ].join(' ')}
            >
              <span className="w-6 font-pixel text-[10px] text-[#8CA6C4] text-center">{entry.rank}</span>
              <span className="w-8 h-8 rounded-pixel bg-[#0E1B2E] border border-black flex items-center justify-center text-sm">
                🧑
              </span>
              <span className="flex-1 text-sm text-white truncate">
                {entry.is_you ? 'You' : entry.username}
              </span>
              <span className="font-pixel text-[10px] text-gold">{entry.xp.toLocaleString()} XP</span>
            </motion.div>
          ))}
        </PixelPanel>
      </div>

      <BottomNav />
    </div>
  );
};
