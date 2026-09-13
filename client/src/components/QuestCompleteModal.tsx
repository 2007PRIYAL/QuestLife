import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Coins, TrendingUp, Flame, Trophy } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelPanel } from './PixelPanel';
import { CATEGORY_ICON, CATEGORY_COLOR } from '@/utils/quests';
import type { QuestRewardResult, QuestCategory } from '@/types';

interface QuestCompleteModalProps {
  result?: QuestRewardResult;
  reward?: QuestRewardResult;
  onContinue?: () => void;
  onClose?: () => void;
}

const QUOTES = [
  'Discipline today, a stronger you tomorrow.',
  'Every quest completed is a life improved.',
  'Small steps, big adventures.',
];

const CONFETTI_COLORS = ['#FFD93D', '#4DA6FF', '#4CAF50', '#FF9F4D', '#FF4B4B', '#B983FF', '#FFE783'];

const ALL_ATTRIBUTES: QuestCategory[] = [
  'HEALTH',
  'STRENGTH',
  'INTELLIGENCE',
  'WISDOM',
  'AGILITY',
];

export const QuestCompleteModal = ({ result, reward, onContinue, onClose }: QuestCompleteModalProps) => {
  const data = result || reward;
  const handleClose = onContinue || onClose || (() => {});

  if (!data) return null;

  const questTitle = data.quest?.title || 'Adventure Task';
  const quote = QUOTES[questTitle.length % QUOTES.length];
  const xpAwarded = data.xp_awarded ?? (data as any).xp_gained ?? 50;
  const coinsAwarded = data.coins_awarded ?? (data as any).coins_gained ?? 25;
  const attrAwarded = data.attribute_points_awarded ?? 1;
  const rawCat = (data.attribute_category || (data as any).attribute_increased || 'INTELLIGENCE')
    .toString()
    .toUpperCase();
  const attrCategory = (ALL_ATTRIBUTES.includes(rawCat as QuestCategory) ? rawCat : 'INTELLIGENCE') as QuestCategory;
  const streak = data.current_streak;

  // Confetti particles: generated and shown ONLY when leveled_up === true
  const confetti = useMemo(() => {
    if (!data.leveled_up) return [];
    return Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * Math.PI * 2;
      const distance = 80 + ((i * 41) % 70);
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: (i % 6) * 0.03,
        size: 3 + (i % 3) * 2,
      };
    });
  }, [data.leveled_up]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-complete-heading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="w-full max-w-[390px]"
      >
        <PixelPanel tone="gold" className="p-5 text-center relative overflow-hidden">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold/20 rounded-full blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue/20 rounded-full blur-2xl" aria-hidden="true" />

          <div className="relative">
            {/* Center icon badge + optional confetti */}
            <div className="relative w-20 h-20 mx-auto mb-3" aria-hidden="true">
              {/* Confetti shown ONLY when leveled_up === true */}
              {data.leveled_up &&
                confetti.map((p) => (
                  <motion.span
                    key={p.id}
                    className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: p.color,
                      width: p.size,
                      height: p.size,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
                    animate={{ x: p.x, y: p.y, opacity: [1, 1, 0], scale: [0.8, 1.2, 0.4] }}
                    transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
                  />
                ))}

              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-b from-gold to-[#B8860B] border-2 border-black shadow-glow flex items-center justify-center"
                initial={{ scale: 0.4, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
              >
                {data.leveled_up ? (
                  <Trophy size={36} className="text-[#3A2400]" aria-hidden="true" />
                ) : (
                  <Sparkles size={34} className="text-[#3A2400]" aria-hidden="true" />
                )}
              </motion.div>
            </div>

            {/* Level-Up Celebration Banner (ONLY when leveled_up === true) */}
            {data.leveled_up ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-3"
              >
                <div className="inline-block bg-gradient-to-r from-[#B8860B] via-gold to-[#B8860B] border-2 border-black rounded-pixel px-3 py-1 shadow-glow mb-1">
                  <span className="font-pixel text-[11px] text-[#3A2400] font-bold">
                    LEVEL UP! LEVEL {data.new_level}
                  </span>
                </div>
                <p className="font-pixel text-[8px] text-gold">Hero Awakened!</p>
              </motion.div>
            ) : (
              <div className="mb-4">
                <h1 id="quest-complete-heading" className="font-pixel text-base text-gold text-shadow-pixel mb-1">
                  Quest Complete!
                </h1>
                <p className="font-pixel text-[8px] text-white">Great Job, Hero!</p>
              </div>
            )}

            {/* Rewards: XP, Coins, Streak */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#0E1B2E] border border-black rounded-pixel p-2 flex flex-col items-center">
                <div className="flex items-center gap-1 text-blue mb-1">
                  <TrendingUp size={13} aria-hidden="true" />
                  <span className="text-[10px] uppercase font-semibold">XP</span>
                </div>
                <span className="font-pixel text-[10px] text-white">+{xpAwarded}</span>
              </div>

              <div className="bg-[#0E1B2E] border border-black rounded-pixel p-2 flex flex-col items-center">
                <div className="flex items-center gap-1 text-gold mb-1">
                  <Coins size={13} aria-hidden="true" />
                  <span className="text-[10px] uppercase font-semibold">Coins</span>
                </div>
                <span className="font-pixel text-[10px] text-white">+{coinsAwarded}</span>
              </div>

              <div className="bg-[#0E1B2E] border border-black rounded-pixel p-2 flex flex-col items-center">
                <div className="flex items-center gap-1 text-[#FF9F4D] mb-1">
                  <Flame size={13} aria-hidden="true" />
                  <span className="text-[10px] uppercase font-semibold">Streak</span>
                </div>
                <span className="font-pixel text-[10px] text-white">
                  {streak ? `${streak}d` : '+1d'}
                </span>
              </div>
            </div>

            {/* Attributes Section: Animate ONLY the attribute that increased */}
            <div className="bg-[#0E1B2E] border border-black rounded-pixel p-3 mb-4 text-left">
              <p className="font-pixel text-[8px] text-[#8CA6C4] mb-2 text-center">Attributes Progress</p>
              <div className="flex flex-col gap-1.5">
                {ALL_ATTRIBUTES.map((cat) => {
                  const isIncreased = attrCategory === cat;
                  const Icon = CATEGORY_ICON[cat];
                  const color = CATEGORY_COLOR[cat];
                  const label = cat.charAt(0) + cat.slice(1).toLowerCase();

                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <Icon size={12} style={{ color }} aria-hidden="true" className="shrink-0" />
                      <span className="text-[10px] text-[#8CA6C4] w-20 shrink-0">{label}</span>

                      {/* Bar container */}
                      <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-black">
                        {isIncreased ? (
                          /* Animate ONLY the attribute that increased */
                          <motion.div
                            className="h-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: '20%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                          />
                        ) : (
                          /* Other attribute bars do not animate */
                          <div
                            className="h-full opacity-40"
                            style={{ backgroundColor: color, width: '40%' }}
                          />
                        )}
                      </div>

                      {/* Attribute point gain label */}
                      <span className="font-pixel text-[8px] w-8 text-right shrink-0" style={{ color: isIncreased ? color : '#5C7A9E' }}>
                        {isIncreased ? `+${attrAwarded}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] italic text-[#8CA6C4] mb-4">&ldquo;{quote}&rdquo;</p>

            <PixelButton variant="gold" onClick={handleClose} autoFocus>
              Continue
            </PixelButton>
          </div>
        </PixelPanel>
      </motion.div>
    </motion.div>
  );
};
