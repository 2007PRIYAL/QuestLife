import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { QuestCard } from '@/components/QuestCard';
import { QuestCompleteModal } from '@/components/QuestCompleteModal';
import { CreateQuestModal } from '@/components/CreateQuestModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { fetchProfile } from '@/api/profile';
import {
  completeQuestRequest,
  fetchQuests,
  formatCountdown,
  getSecondsUntilMidnight,
} from '@/api/quests';
import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { Profile, Quest, QuestRewardResult } from '@/types';

type Tab = 'DAILY' | 'MAIN' | 'SIDE' | 'COMPLETED';

const TABS: { key: Tab; label: string }[] = [
  { key: 'DAILY', label: 'Daily' },
  { key: 'MAIN', label: 'Main' },
  { key: 'SIDE', label: 'Side' },
  { key: 'COMPLETED', label: 'Completed' },
];

export const Quests = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [tab, setTab] = useState<Tab>('DAILY');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [rewardResult, setRewardResult] = useState<QuestRewardResult | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const load = async () => {
    try {
      const [profileData, questsData] = await Promise.all([fetchProfile(), fetchQuests()]);
      setProfile(profileData);
      setQuests(questsData.filter((q) => !q.is_archived));
      setSecondsLeft(getSecondsUntilMidnight(profileData.timezone || 'UTC'));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your quests.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 1-second interval ticker for countdown timer until daily reset
  useEffect(() => {
    if (!profile?.timezone) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Reached midnight: reload quests to un-mark completed_today
          load();
          return getSecondsUntilMidnight(profile.timezone || 'UTC');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [profile?.timezone]);

  const visibleQuests = useMemo(() => {
    switch (tab) {
      case 'MAIN':
        return quests.filter((q) => q.type === 'MAIN');
      case 'SIDE':
        return quests.filter((q) => q.type === 'SIDE');
      case 'COMPLETED':
        return quests.filter((q) => q.completed_today);
      case 'DAILY':
      default:
        return quests.filter((q) => !q.completed_today);
    }
  }, [quests, tab]);

  const handleComplete = async (quest: Quest) => {
    // Disable XP Farming: prevent completing already-completed quests
    if (quest.completed_today || submittingId) return;

    setSubmittingId(quest.id);
    setError('');
    try {
      const result = await completeQuestRequest(quest);
      setRewardResult(result);

      // Refresh everything automatically without requiring page reload
      await refreshUser();
      const [freshProfile, freshQuests] = await Promise.all([fetchProfile(), fetchQuests()]);
      setProfile(freshProfile);
      setQuests(freshQuests.filter((q) => !q.is_archived));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not complete that quest.'));
    } finally {
      setSubmittingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Gathering your quests..." />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="font-pixel text-[14px] text-gold text-shadow-pixel">Quests</h1>
          <p className="text-xs text-[#8CA6C4] mt-1">Turn your goals into adventures</p>
        </div>

        {/* Daily Quest Reset Countdown Timer */}
        <div
          className="flex items-center gap-1.5 bg-[#0E1B2E] border-2 border-black rounded-pixel px-2.5 py-1.5 text-[8px] font-pixel text-[#8CA6C4]"
          title="Time until daily quests reset"
        >
          <Clock size={12} className="text-gold shrink-0" aria-hidden="true" />
          <span>Resets {formatCountdown(secondsLeft)}</span>
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-3 overflow-x-auto" role="tablist" aria-label="Quest filters">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={[
              'font-pixel text-[9px] px-3 py-2 rounded-pixel border-2 border-black whitespace-nowrap',
              tab === key ? 'bg-gold text-[#3A2400]' : 'bg-[#0E1B2E] text-[#8CA6C4]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col gap-3">
        {error && <ErrorBanner message={error} />}

        {visibleQuests.length === 0 && (
          <PixelEmptyState tab={tab} />
        )}

        <AnimatePresence initial={false}>
          {visibleQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isCompleted={Boolean(quest.completed_today)}
              isSubmitting={submittingId === quest.id}
              onComplete={handleComplete}
            />
          ))}
        </AnimatePresence>
      </div>

      <FloatingActionButton label="Create new quest" onClick={() => setIsCreateOpen(true)} />

      <BottomNav />

      <AnimatePresence>
        {rewardResult && (
          <QuestCompleteModal result={rewardResult} onContinue={() => setRewardResult(null)} />
        )}
        {isCreateOpen && (
          <CreateQuestModal
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => {
              load();
              setTab('DAILY');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PixelEmptyState = ({ tab }: { tab: Tab }) => {
  const copy =
    tab === 'COMPLETED'
      ? 'No quests completed today yet. Go earn some XP, hero.'
      : 'No quests here. Create one to start your adventure.';
  return (
    <div className="text-center py-10 text-[#5C7A9E] text-sm">
      <p>{copy}</p>
    </div>
  );
};
