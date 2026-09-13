import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  BookOpen,
  Timer,
  BarChart3,
  Trophy,
  Map,
  Shield,
  Zap,
} from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { WaterTrackerWidget } from '@/components/WaterTrackerWidget';
import { SleepQuestWidget } from '@/components/SleepQuestWidget';
import { DailyChestWidget } from '@/components/DailyChestWidget';
import { SmartQuestModal } from '@/components/SmartQuestModal';
import { QuestCompleteModal } from '@/components/QuestCompleteModal';
import { fetchProfile } from '@/api/profile';
import { fetchQuests, completeQuestRequest } from '@/api/quests';
import { getApiErrorMessage } from '@/api/client';
import { getCharacterEvolution } from '@/utils/characterEvolution';
import { getCharacterById } from '@/utils/characters';
import { CATEGORY_ICON } from '@/utils/quests';
import { useAuth } from '@/context/AuthContext';
import type { Profile, Quest, QuestRewardResult } from '@/types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSmartPlannerOpen, setIsSmartPlannerOpen] = useState(false);
  const [completedReward, setCompletedReward] = useState<QuestRewardResult | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profileData, questsData] = await Promise.all([fetchProfile(), fetchQuests()]);
      setProfile(profileData);
      setQuests(questsData.filter((q) => !q.is_archived));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load today’s adventure data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleAuthChange = () => loadData();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Today's Missions calculation
  const { mainQuests, sideQuests, miniQuests, totalXpAvailable, completedCount, totalCount, dailyProgress } =
    useMemo(() => {
      const main = quests.filter((q) => q.type === 'MAIN');
      const side = quests.filter((q) => q.type === 'SIDE');
      const mini = quests.filter((q) => q.type === 'MINI');

      const completed = quests.filter((q) => q.completed_today).length;
      const total = quests.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const xpSum = quests
        .filter((q) => !q.completed_today)
        .reduce((sum, q) => sum + (q.base_xp || 0), 0);

      return {
        mainQuests: main,
        sideQuests: side,
        miniQuests: mini,
        totalXpAvailable: xpSum,
        completedCount: completed,
        totalCount: total,
        dailyProgress: progress,
      };
    }, [quests]);

  const handleCompleteQuest = async (quest: Quest) => {
    if (quest.completed_today || completingId) return;
    setCompletingId(quest.id);

    try {
      const reward = await completeQuestRequest(quest.id);
      setCompletedReward(reward);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to complete quest.'));
    } finally {
      setCompletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Loading Today's Adventure..." />
      </div>
    );
  }

  const evolution = profile ? getCharacterEvolution(profile.level) : null;
  const character = profile ? getCharacterById(profile.avatar_url) : null;

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      {error && (
        <div className="p-3">
          <ErrorBanner message={error} />
        </div>
      )}

      <main className="flex-1 px-4 py-3 space-y-3.5 pb-8 overflow-y-auto">
        {/* ========================================================
            HERO STATUS & DAILY PROGRESS SUMMARY
            ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-border bg-[#0E1B2E] rounded-pixel p-3.5 relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            {/* Hero Badge & Avatar */}
            <div
              onClick={() => navigate('/stats')}
              className={[
                'w-14 h-14 rounded-pixel flex items-center justify-center bg-[#081220] shrink-0 cursor-pointer',
                evolution?.borderClass,
                evolution?.glowClass,
              ].join(' ')}
            >
              {character?.icon ? (
                <character.icon size={28} style={{ color: character.color }} />
              ) : (
                <span className="text-2xl">⚔️</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-pixel text-[11px] text-gold truncate">
                  {user?.username || 'Hero'}
                </h1>
                <span
                  className={[
                    'font-pixel text-[6px] px-1.5 py-0.5 rounded border border-black',
                    evolution?.badgeBg,
                  ].join(' ')}
                >
                  {evolution?.badgeLabel}
                </span>
              </div>
              <p className="text-[9px] text-[#8CA6C4] mt-0.5 truncate">
                {evolution?.rankTitle} • Level {profile?.level}
              </p>
              <div className="flex items-center gap-2 mt-1 font-pixel text-[7px]">
                <span className="text-gold">🪙 {profile?.coins} Coins</span>
                <span className="text-[#FF9F4D]">🔥 {profile?.current_streak || 0}d Streak</span>
              </div>
            </div>

            {/* Daily Completion Circular Ring */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-black/60"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-gold"
                    strokeDasharray={`${dailyProgress}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-pixel text-[8px] text-white">
                  {dailyProgress}%
                </span>
              </div>
              <span className="font-pixel text-[6px] text-[#8CA6C4] mt-0.5">
                {completedCount}/{totalCount} Done
              </span>
            </div>
          </div>

          {/* XP Banner */}
          <div className="mt-3 pt-2.5 border-t border-black flex items-center justify-between font-pixel text-[7px]">
            <span className="text-blue">Today’s Available Bounty:</span>
            <span className="text-gold">+{totalXpAvailable} XP Available</span>
          </div>
        </motion.div>

        {/* ========================================================
            QUICK ACTION TILES
            ======================================================== */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setIsSmartPlannerOpen(true)}
            className="flex flex-col items-center gap-1 p-2 bg-[#0E1B2E] border border-gold/40 hover:border-gold rounded-pixel transition-all active:scale-95 text-center cursor-pointer shadow-glow"
          >
            <span className="p-1.5 rounded-pixel bg-gold/15 text-gold">
              <Zap size={15} />
            </span>
            <span className="font-pixel text-[6px] text-gold">Quest AI</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/focus')}
            className="flex flex-col items-center gap-1 p-2 bg-[#0E1B2E] border border-blue/30 hover:border-blue rounded-pixel transition-all active:scale-95 text-center cursor-pointer"
          >
            <span className="p-1.5 rounded-pixel bg-blue/15 text-blue">
              <Timer size={15} />
            </span>
            <span className="font-pixel text-[6px] text-white">Focus</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="flex flex-col items-center gap-1 p-2 bg-[#0E1B2E] border border-[#B983FF]/30 hover:border-[#B983FF] rounded-pixel transition-all active:scale-95 text-center cursor-pointer"
          >
            <span className="p-1.5 rounded-pixel bg-[#B983FF]/15 text-[#B983FF]">
              <BarChart3 size={15} />
            </span>
            <span className="font-pixel text-[6px] text-white">Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/journal')}
            className="flex flex-col items-center gap-1 p-2 bg-[#0E1B2E] border border-[#4CAF50]/30 hover:border-[#4CAF50] rounded-pixel transition-all active:scale-95 text-center cursor-pointer"
          >
            <span className="p-1.5 rounded-pixel bg-[#4CAF50]/15 text-[#4CAF50]">
              <BookOpen size={15} />
            </span>
            <span className="font-pixel text-[6px] text-white">Journal</span>
          </button>
        </div>

        {/* ========================================================
            DAILY REWARD CHEST WIDGET
            ======================================================== */}
        <DailyChestWidget onRewardClaimed={loadData} />

        {/* ========================================================
            DAILY HABITS (WATER & SLEEP)
            ======================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-[10px] text-white flex items-center gap-1.5">
              <span>💧</span> Daily Habits
            </h2>
          </div>

          <WaterTrackerWidget onRewardClaimed={loadData} />
          <SleepQuestWidget onRewardClaimed={loadData} />
        </div>

        {/* ========================================================
            TODAY'S MISSIONS (MAIN, SIDE, MINI)
            ======================================================== */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-[10px] text-white flex items-center gap-1.5">
              <span>⚔️</span> Today's Missions ({completedCount}/{totalCount})
            </h2>
            <button
              type="button"
              onClick={() => navigate('/quests')}
              className="font-pixel text-[7px] text-blue hover:text-gold flex items-center gap-0.5"
            >
              View All <ChevronRight size={10} />
            </button>
          </div>

          {quests.length === 0 ? (
            <div className="pixel-border bg-[#0E1B2E]/90 rounded-pixel p-5 text-center">
              <p className="font-pixel text-[8px] text-[#8CA6C4] mb-3">
                No active quests for today, adventurer!
              </p>
              <button
                type="button"
                onClick={() => setIsSmartPlannerOpen(true)}
                className="px-3.5 py-2 bg-gold text-[#3A2400] text-[8px] font-pixel rounded shadow-glow font-bold active:scale-95"
              >
                + Forge Your First Quest
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Prioritized Quests preview: Uncompleted first */}
              {quests
                .slice()
                .sort((a, b) => (a.completed_today ? 1 : 0) - (b.completed_today ? 1 : 0))
                .slice(0, 4)
                .map((quest) => {
                  const CategoryIcon = CATEGORY_ICON[quest.category] || Shield;
                  const isDone = Boolean(quest.completed_today);
                  const isWorking = completingId === quest.id;

                  return (
                    <div
                      key={quest.id}
                      className={[
                        'p-2.5 rounded-pixel border-2 border-black flex items-center justify-between gap-2.5 transition-all',
                        isDone
                          ? 'bg-[#0B1522]/60 opacity-75 border-black/40'
                          : 'bg-[#0E1B2E] hover:border-[#38BDF8]/50 shadow-sm',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={[
                            'w-8 h-8 rounded-pixel flex items-center justify-center shrink-0 border border-black',
                            isDone ? 'bg-green text-[#0B2411]' : 'bg-[#14233D] text-blue',
                          ].join(' ')}
                        >
                          {isDone ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <CategoryIcon size={16} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <h4
                            className={[
                              'font-pixel text-[8px] truncate',
                              isDone ? 'line-through text-[#8CA6C4]' : 'text-white',
                            ].join(' ')}
                          >
                            {quest.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 font-pixel text-[6px] text-[#8CA6C4]">
                            <span className="text-gold">+{quest.base_xp} XP</span>
                            <span>•</span>
                            <span>{quest.type}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCompleteQuest(quest)}
                        disabled={isDone || isWorking}
                        className={[
                          'shrink-0 px-2.5 py-1.5 rounded font-pixel text-[7px] border border-black font-bold transition-transform',
                          isDone
                            ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                            : 'bg-gold text-[#3A2400] shadow-glow active:scale-95 cursor-pointer',
                        ].join(' ')}
                      >
                        {isWorking ? 'Claiming...' : isDone ? 'Done' : 'Complete'}
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Smart Quest Planner Modal */}
      {isSmartPlannerOpen && (
        <SmartQuestModal
          onClose={() => setIsSmartPlannerOpen(false)}
          onCreated={loadData}
        />
      )}

      {/* Quest Complete Celebration Modal */}
      {completedReward && (
        <QuestCompleteModal
          reward={completedReward}
          onClose={() => setCompletedReward(null)}
        />
      )}
    </div>
  );
};
