import { motion } from 'framer-motion';
import { Coins, Sparkles } from 'lucide-react';
import { PixelPanel } from './PixelPanel';
import { PixelButton } from './PixelButton';
import { QUEST_TYPE_ICON, QUEST_TYPE_LABEL } from '@/utils/quests';
import type { Quest } from '@/types';

interface QuestCardProps {
  quest: Quest;
  isCompleted: boolean;
  isSubmitting: boolean;
  onComplete: (quest: Quest) => void;
}

export const QuestCard = ({ quest, isCompleted, isSubmitting, onComplete }: QuestCardProps) => {
  const Icon = QUEST_TYPE_ICON[quest.type];
  const progress = isCompleted ? 1 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <PixelPanel tone="blue" className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 shrink-0 rounded-pixel bg-[#0E1B2E] border-2 border-black flex items-center justify-center text-blue">
            <Icon size={20} aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-pixel text-[8px] text-blue mb-1">{QUEST_TYPE_LABEL[quest.type]}</p>
            <h3 className="font-semibold text-white text-sm leading-snug truncate">{quest.title}</h3>
            {quest.description && (
              <p className="text-xs text-[#8CA6C4] mt-0.5 line-clamp-2">{quest.description}</p>
            )}

            <div className="mt-2.5">
              <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-black">
                <motion.div
                  className={isCompleted ? 'h-full bg-green' : 'h-full bg-[#2A3F5C]'}
                  initial={false}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-[#5C7A9E] mt-1">{progress}/1</p>
            </div>

            <div className="flex items-center justify-between mt-3 gap-2">
              <div className="flex items-center gap-3 text-[11px] font-pixel">
                <span className="flex items-center gap-1 text-gold">
                  <Sparkles size={12} aria-hidden="true" /> +{quest.base_xp} XP
                </span>
                <span className="flex items-center gap-1 text-blue">
                  <Coins size={12} aria-hidden="true" /> {quest.base_coins}
                </span>
              </div>

              <PixelButton
                variant={isCompleted ? 'dark' : 'gold'}
                fullWidth={false}
                disabled={isCompleted || isSubmitting}
                onClick={() => onComplete(quest)}
                className="text-[9px] py-2.5 px-4"
              >
                {isCompleted ? 'Done' : isSubmitting ? '...' : 'Start'}
              </PixelButton>
            </div>
          </div>
        </div>
      </PixelPanel>
    </motion.div>
  );
};
