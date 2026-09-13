import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sunrise, Clock, CheckCircle2 } from 'lucide-react';
import {
  getSleepData,
  saveSleepSchedule,
  canCheckInSleepToday,
  checkInSleepToday,
} from '@/utils/habits';
import { fetchQuests, createQuestRequest, completeQuestRequest } from '@/api/quests';

interface SleepQuestWidgetProps {
  onRewardClaimed?: () => void;
}

export const SleepQuestWidget = ({ onRewardClaimed }: SleepQuestWidgetProps) => {
  const [sleepData, setSleepData] = useState(getSleepData());
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [bedtime, setBedtime] = useState(sleepData.bedtime);
  const [wakeTime, setWakeTime] = useState(sleepData.wakeTime);
  const [isEditing, setIsEditing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const data = getSleepData();
    setSleepData(data);
    setBedtime(data.bedtime);
    setWakeTime(data.wakeTime);
    setCanCheckIn(canCheckInSleepToday());
  }, []);

  const handleSaveSchedule = () => {
    saveSleepSchedule(bedtime, wakeTime);
    setSleepData(getSleepData());
    setIsEditing(false);
    setStatusMsg('Sleep schedule committed. Rest well tonight, hero!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleMorningCheckIn = async () => {
    if (!canCheckIn || isClaiming) return;
    setIsClaiming(true);

    try {
      // Award via real backend quest completion
      const quests = await fetchQuests();
      let sleepQuest = quests.find(
        (q) =>
          !q.is_archived &&
          q.category === 'HEALTH' &&
          q.title.toLowerCase().includes('sleep') &&
          !q.completed_today,
      );

      if (!sleepQuest) {
        sleepQuest = await createQuestRequest({
          title: 'Night Quest: Rest & Recover',
          description: `Logged a restful night's sleep (${bedtime} to ${wakeTime}).`,
          type: 'SIDE',
          category: 'HEALTH',
          map_index: 1,
        });
      }

      await completeQuestRequest(sleepQuest.id);
      const { streak } = checkInSleepToday();
      setSleepData(getSleepData());
      setCanCheckIn(false);
      setStatusMsg(`Morning Rest Confirmed! +60 XP • Health +2 • Wisdom +2 • Streak: ${streak}d`);
      onRewardClaimed?.();
    } catch {
      // Fallback local check-in
      const { streak } = checkInSleepToday();
      setSleepData(getSleepData());
      setCanCheckIn(false);
      setStatusMsg(`Rest Verified! Streak: ${streak}d`);
      onRewardClaimed?.();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="pixel-border bg-[#0E1B2E]/90 rounded-pixel p-3.5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-pixel bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/40">
            <Moon size={18} />
          </span>
          <div>
            <h3 className="font-pixel text-[10px] text-white flex items-center gap-1.5">
              Night Quest
              {!canCheckIn && <CheckCircle2 size={13} className="text-[#4CAF50]" />}
            </h3>
            <p className="text-[9px] text-[#8CA6C4]">
              Schedule: {sleepData.bedtime} → {sleepData.wakeTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7px] text-[#A5B4FC] bg-[#6366F1]/15 px-2 py-1 rounded border border-[#6366F1]/30">
            🔥 {sleepData.sleepStreak}d Streak
          </span>
        </div>
      </div>

      {statusMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-pixel text-[7px] text-gold mb-2.5 bg-gold/10 p-1.5 rounded border border-gold/30 text-center"
        >
          {statusMsg}
        </motion.p>
      )}

      {isEditing ? (
        <div className="bg-[#14233D] p-2.5 rounded-pixel border border-black mb-2 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[8px] font-pixel text-[#8CA6C4]">
            <div>
              <label className="block mb-1">Bedtime</label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full bg-[#081220] text-white px-2 py-1 rounded border border-[#334155] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block mb-1">Wake time</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-[#081220] text-white px-2 py-1 rounded border border-[#334155] text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-[8px] font-pixel text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSchedule}
              className="px-3 py-1 bg-gold text-[#3A2400] text-[8px] font-pixel rounded shadow-glow font-bold"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 font-pixel text-[7px] text-[#8CA6C4] hover:text-white py-1 px-2 rounded hover:bg-white/5"
          >
            <Clock size={11} />
            Edit Hours
          </button>

          {canCheckIn ? (
            <motion.button
              type="button"
              onClick={handleMorningCheckIn}
              disabled={isClaiming}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[8px] font-pixel rounded-pixel shadow-[0_0_8px_rgba(99,102,241,0.5)] border border-black cursor-pointer"
            >
              <Sunrise size={12} />
              {isClaiming ? 'Checking In...' : 'Morning Check-In'}
            </motion.button>
          ) : (
            <span className="font-pixel text-[7px] text-[#4CAF50] bg-[#4CAF50]/15 px-2 py-1 rounded border border-[#4CAF50]/30">
              Rest Verified Today
            </span>
          )}
        </div>
      )}
    </div>
  );
};
