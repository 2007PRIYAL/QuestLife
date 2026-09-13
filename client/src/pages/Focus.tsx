import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check, Sparkles, Brain, BookOpen } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { QuestCompleteModal } from '@/components/QuestCompleteModal';
import { fetchProfile } from '@/api/profile';
import { fetchQuests, completeQuestRequest } from '@/api/quests';
import { logFocusSession } from '@/utils/habits';
import type { Profile, Quest, QuestRewardResult } from '@/types';

const PRESETS = [
  { minutes: 25, label: 'Standard', sub: '25m Sprint' },
  { minutes: 50, label: 'Deep Work', sub: '50m Focus' },
  { minutes: 90, label: 'Ultra', sub: '90m Master' },
];

export const Focus = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studyQuests, setStudyQuests] = useState<Quest[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedReward, setCompletedReward] = useState<QuestRewardResult | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const load = async () => {
    try {
      const [profileData, questsData] = await Promise.all([fetchProfile(), fetchQuests()]);
      setProfile(profileData);
      const study = questsData.filter(
        (q) => !q.is_archived && (q.category === 'INTELLIGENCE' || q.category === 'WISDOM'),
      );
      setStudyQuests(study);
      if (study.length > 0 && !selectedQuestId) {
        setSelectedQuestId(study[0].id);
      }
    } catch {
      setError('Could not load focus quests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isActive && timeLeftSec > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSec((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeftSec]);

  const handleSelectPreset = (mins: number) => {
    if (isActive) return;
    setSelectedMinutes(mins);
    setTimeLeftSec(mins * 60);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeftSec(selectedMinutes * 60);
  };

  const handleCompleteSession = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setIsActive(false);

    const minutesDone = selectedMinutes - Math.floor(timeLeftSec / 60);
    const quest = studyQuests.find((q) => q.id === selectedQuestId);
    const questTitle = quest?.title || 'Deep Focus Session';
    logFocusSession(Math.max(1, minutesDone), questTitle);

    try {
      if (quest && !quest.completed_today) {
        const reward = await completeQuestRequest(quest.id);
        setCompletedReward(reward);
      } else {
        // Standalone focus session completion
        setCompletedReward({
          quest: quest || {
            id: 'focus-session',
            user_id: profile?.user_id || '',
            title: questTitle,
            description: 'Pomodoro focus sanctuary session',
            type: 'MINI',
            category: 'INTELLIGENCE',
            base_xp: Math.round(selectedMinutes * 1.5),
            base_coins: Math.round(selectedMinutes * 0.8),
            attribute_points: 1,
            map_index: 1,
            is_recurring: false,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          xp_awarded: Math.round(selectedMinutes * 1.5),
          coins_awarded: Math.round(selectedMinutes * 0.8),
          attribute_points_awarded: 1,
          attribute_category: 'INTELLIGENCE',
          leveled_up: false,
          new_level: profile?.level || 1,
          current_streak: (profile?.current_streak || 0) + 1,
        });
      }
      await load();
    } catch {
      // Fallback completion
      setCompletedReward({
        quest: quest || {
          id: 'focus-session',
          user_id: profile?.user_id || '',
          title: questTitle,
          description: 'Pomodoro focus sanctuary session',
          type: 'MINI',
          category: 'INTELLIGENCE',
          base_xp: Math.round(selectedMinutes * 1.5),
          base_coins: Math.round(selectedMinutes * 0.8),
          attribute_points: 1,
          map_index: 1,
          is_recurring: false,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        xp_awarded: Math.round(selectedMinutes * 1.5),
        coins_awarded: Math.round(selectedMinutes * 0.8),
        attribute_points_awarded: 1,
        attribute_category: 'INTELLIGENCE',
        leveled_up: false,
        new_level: profile?.level || 1,
        current_streak: (profile?.current_streak || 0) + 1,
      });
    } finally {
      setIsFinishing(false);
      resetTimer();
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Summoning Focus Sanctuary..." />
      </div>
    );
  }

  const totalSec = selectedMinutes * 60;
  const progressRatio = totalSec > 0 ? (totalSec - timeLeftSec) / totalSec : 0;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      {error && (
        <div className="p-3">
          <ErrorBanner message={error} />
        </div>
      )}

      <main className="flex-1 px-4 py-4 space-y-4 flex flex-col justify-between pb-8 overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <p className="font-pixel text-[7px] text-blue mb-1">POMODORO FOCUS QUEST</p>
          <h1 className="font-pixel text-[13px] text-gold text-shadow-pixel">Deep Mind Chamber</h1>
          <p className="text-[10px] text-[#8CA6C4] mt-1">
            Focus without distraction to forge mental mana and intelligence.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => {
            const isSelected = selectedMinutes === preset.minutes;
            return (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => handleSelectPreset(preset.minutes)}
                disabled={isActive}
                className={[
                  'p-2 rounded-pixel border-2 transition-all text-center',
                  isSelected
                    ? 'border-gold bg-gold/15 text-gold shadow-glow'
                    : 'border-black bg-[#0E1B2E] text-[#8CA6C4] hover:text-white',
                  isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95',
                ].join(' ')}
              >
                <div className="font-pixel text-[8px]">{preset.sub}</div>
                <div className="text-[8px] text-[#8CA6C4]">{preset.label}</div>
              </button>
            );
          })}
        </div>

        {/* Big Circular Progress Timer */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-4 rounded-full bg-blue/10 filter blur-xl" />

            <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                strokeWidth="6"
                stroke="rgba(0,0,0,0.6)"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                stroke={isActive ? '#38BDF8' : '#FBBF24'}
                fill="none"
                className="transition-all duration-300"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-pixel text-3xl text-white text-shadow-pixel tracking-wider">
                {displayTime}
              </span>
              <span className="font-pixel text-[8px] text-blue mt-1">
                {isActive ? 'FOCUSING...' : timeLeftSec === 0 ? 'COMPLETED!' : 'READY'}
              </span>
            </div>
          </div>
        </div>

        {/* Link to Quest Selector */}
        {studyQuests.length > 0 && (
          <div className="pixel-border bg-[#0E1B2E] p-2.5 rounded-pixel">
            <label className="block font-pixel text-[7px] text-gold mb-1">
              Link to Active Quest (Auto-Completes on Timer):
            </label>
            <select
              value={selectedQuestId}
              onChange={(e) => setSelectedQuestId(e.target.value)}
              disabled={isActive}
              className="w-full bg-[#081220] text-white px-2 py-1.5 rounded border border-[#334155] text-xs font-pixel text-[8px] cursor-pointer"
            >
              <option value="">None (Independent Focus)</option>
              {studyQuests.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.type} • +{q.base_xp} XP)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={resetTimer}
            title="Reset Timer"
            className="w-12 h-12 rounded-pixel pixel-border bg-[#14233D] text-[#8CA6C4] hover:text-white flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <RotateCcw size={18} />
          </button>

          <motion.button
            type="button"
            onClick={toggleTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={[
              'px-8 py-3 rounded-pixel font-pixel text-xs border-2 border-black flex items-center gap-2 shadow-glow font-bold cursor-pointer',
              isActive
                ? 'bg-[#EF4444] text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-gold text-[#3A2400]',
            ].join(' ')}
          >
            {isActive ? (
              <>
                <Pause size={16} /> PAUSE
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> START FOCUS
              </>
            )}
          </motion.button>

          <button
            type="button"
            onClick={handleCompleteSession}
            disabled={isFinishing || timeLeftSec === totalSec}
            title="Complete Early & Award Rewards"
            className={[
              'w-12 h-12 rounded-pixel pixel-border bg-[#14233D] flex items-center justify-center active:scale-95',
              timeLeftSec !== totalSec
                ? 'text-[#4CAF50] hover:bg-[#4CAF50]/20 cursor-pointer'
                : 'text-[#475569] cursor-not-allowed',
            ].join(' ')}
          >
            <Check size={20} />
          </button>
        </div>
      </main>

      <BottomNav />

      {completedReward && (
        <QuestCompleteModal
          reward={completedReward}
          onClose={() => setCompletedReward(null)}
        />
      )}
    </div>
  );
};
