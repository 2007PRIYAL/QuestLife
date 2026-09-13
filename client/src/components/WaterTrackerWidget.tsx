import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Plus, CheckCircle2 } from 'lucide-react';
import {
  WATER_GOAL_ML,
  getTodayWaterIntake,
  addWaterIntake,
  isWaterGoalClaimedToday,
  setWaterGoalClaimedToday,
} from '@/utils/habits';
import { fetchQuests, createQuestRequest, completeQuestRequest } from '@/api/quests';

interface WaterTrackerWidgetProps {
  onRewardClaimed?: () => void;
}

export const WaterTrackerWidget = ({ onRewardClaimed }: WaterTrackerWidgetProps) => {
  const [currentMl, setCurrentMl] = useState(0);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState('');

  useEffect(() => {
    setCurrentMl(getTodayWaterIntake());
    setIsClaimed(isWaterGoalClaimedToday());
  }, []);

  const progressPercent = Math.min(100, Math.floor((currentMl / WATER_GOAL_ML) * 100));

  const handleAddWater = async (amount: number) => {
    const { currentMl: nextMl, goalReached } = addWaterIntake(amount);
    setCurrentMl(nextMl);

    // If reached 2L and not claimed today, claim 1 single backend Health Mini Quest
    if (goalReached && !isClaimed && !isWaterGoalClaiming) {
      await claimWaterQuestReward();
    }
  };

  const isWaterGoalClaiming = isClaiming;

  const claimWaterQuestReward = async () => {
    setIsClaiming(true);
    try {
      // Find an existing uncompleted water / health mini quest, or create one
      const quests = await fetchQuests();
      let targetQuest = quests.find(
        (q) =>
          !q.is_archived &&
          q.category === 'HEALTH' &&
          q.type === 'MINI' &&
          !q.completed_today,
      );

      if (!targetQuest) {
        targetQuest = await createQuestRequest({
          title: 'Daily Hydration: 2L Reached',
          description: 'Drank 2,000 ml of fresh water to restore vitality.',
          type: 'MINI',
          category: 'HEALTH',
          map_index: 1,
        });
      }

      await completeQuestRequest(targetQuest.id);
      setWaterGoalClaimedToday();
      setIsClaimed(true);
      setCelebrationMsg('+30 XP • +10 Coins • +1 Health Awarded!');
      onRewardClaimed?.();
    } catch {
      // Fallback local claim
      setWaterGoalClaimedToday();
      setIsClaimed(true);
      setCelebrationMsg('2L Goal Reached! Health Boosted.');
      onRewardClaimed?.();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="pixel-border bg-[#0E1B2E]/90 rounded-pixel p-3.5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-pixel bg-[#0284C7]/20 text-[#38BDF8] border border-[#38BDF8]/40">
            <Droplet size={18} />
          </span>
          <div>
            <h3 className="font-pixel text-[10px] text-white flex items-center gap-1.5">
              Hydration Quest
              {progressPercent >= 100 && (
                <CheckCircle2 size={13} className="text-[#4CAF50]" />
              )}
            </h3>
            <p className="text-[9px] text-[#8CA6C4]">
              {currentMl} / {WATER_GOAL_ML} ml ({progressPercent}%)
            </p>
          </div>
        </div>

        {progressPercent >= 100 && isClaimed ? (
          <span className="font-pixel text-[7px] text-[#4CAF50] bg-[#4CAF50]/15 px-2 py-1 rounded border border-[#4CAF50]/40">
            Goal Cleared
          </span>
        ) : (
          <span className="font-pixel text-[7px] text-gold bg-gold/10 px-2 py-1 rounded border border-gold/30">
            +30 XP at 2L
          </span>
        )}
      </div>

      {/* Water Fill Progress Bar */}
      <div className="h-3 w-full bg-black/80 rounded-full overflow-hidden border border-black mb-3 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {celebrationMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-pixel text-[7px] text-[#4CAF50] mb-2.5 text-center"
        >
          {celebrationMsg}
        </motion.p>
      )}

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleAddWater(250)}
          className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#16273F] hover:bg-[#1E3A5F] active:scale-95 border border-[#38BDF8]/40 rounded-pixel font-pixel text-[8px] text-[#BAE6FD] transition-colors"
        >
          <Plus size={10} />
          250ml
        </button>
        <button
          type="button"
          onClick={() => handleAddWater(500)}
          className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#16273F] hover:bg-[#1E3A5F] active:scale-95 border border-[#38BDF8]/40 rounded-pixel font-pixel text-[8px] text-[#BAE6FD] transition-colors"
        >
          <Plus size={10} />
          500ml
        </button>
        <button
          type="button"
          onClick={() => handleAddWater(750)}
          className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#16273F] hover:bg-[#1E3A5F] active:scale-95 border border-[#38BDF8]/40 rounded-pixel font-pixel text-[8px] text-[#BAE6FD] transition-colors"
        >
          <Plus size={10} />
          750ml
        </button>
      </div>
    </div>
  );
};
