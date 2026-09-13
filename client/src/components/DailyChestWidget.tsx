import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Clock, Sparkles, X, Check } from 'lucide-react';
import {
  canOpenChest,
  getChestCooldownSeconds,
  claimDailyChest,
  ChestReward,
} from '@/utils/habits';
import { updateProfileRequest } from '@/api/profile';

interface DailyChestWidgetProps {
  onRewardClaimed?: () => void;
}

export const DailyChestWidget = ({ onRewardClaimed }: DailyChestWidgetProps) => {
  const [cooldownSec, setCooldownSec] = useState(getChestCooldownSeconds());
  const [isAvailable, setIsAvailable] = useState(canOpenChest());
  const [reward, setReward] = useState<ChestReward | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getChestCooldownSeconds();
      setCooldownSec(remaining);
      setIsAvailable(remaining === 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOpenChest = async () => {
    if (!isAvailable || isOpening) return;
    setIsOpening(true);

    setTimeout(async () => {
      const claimed = claimDailyChest();
      if (claimed) {
        setReward(claimed);
        setIsAvailable(false);
        setCooldownSec(getChestCooldownSeconds());

        // Update profile cosmetically if possible or notify parent
        try {
          window.dispatchEvent(new CustomEvent('auth-change'));
        } catch {}
        onRewardClaimed?.();
      }
      setIsOpening(false);
    }, 900);
  };

  return (
    <>
      <div className="pixel-border bg-[#0E1B2E]/90 rounded-pixel p-3.5 relative overflow-hidden flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <motion.button
            type="button"
            onClick={handleOpenChest}
            disabled={!isAvailable || isOpening}
            animate={
              isAvailable
                ? {
                    rotate: [0, -4, 4, -4, 0],
                    scale: [1, 1.05, 1],
                  }
                : undefined
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className={[
              'w-12 h-12 rounded-pixel border-2 border-black flex items-center justify-center text-2xl transition-all cursor-pointer',
              isAvailable
                ? 'bg-gradient-to-br from-gold to-[#D4AF37] shadow-glow active:scale-95'
                : 'bg-[#1E293B] text-[#64748B] opacity-70 cursor-not-allowed',
            ].join(' ')}
          >
            🎁
          </motion.button>
          <div>
            <h3 className="font-pixel text-[10px] text-gold flex items-center gap-1.5">
              Daily Reward Chest
              {isAvailable && <Sparkles size={12} className="text-gold animate-pulse" />}
            </h3>
            <p className="text-[9px] text-[#8CA6C4]">
              {isAvailable ? 'Ready to unlock your daily bounty!' : 'Resets once every 24 hours'}
            </p>
          </div>
        </div>

        <div>
          {isAvailable ? (
            <motion.button
              type="button"
              onClick={handleOpenChest}
              disabled={isOpening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-gold text-[#3A2400] text-[8px] font-pixel rounded-pixel shadow-glow border border-black font-bold cursor-pointer"
            >
              {isOpening ? 'Opening...' : 'Open!'}
            </motion.button>
          ) : (
            <div className="flex items-center gap-1 font-pixel text-[7px] text-[#8CA6C4] bg-black/60 px-2 py-1 rounded border border-[#334155]">
              <Clock size={10} />
              <span>{formatCountdown(cooldownSec)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reward Modal */}
      <AnimatePresence>
        {reward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="pixel-border-gold bg-[#0E1B2E] p-5 max-w-xs w-full text-center rounded-pixel relative shadow-[0_0_25px_rgba(255,217,61,0.4)]"
            >
              <button
                type="button"
                onClick={() => setReward(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="text-4xl mb-2 animate-bounce">✨ 💎 ✨</div>
              <h2 className="font-pixel text-xs text-gold mb-1">CHEST UNLOCKED!</h2>
              <p className="text-[10px] text-[#8CA6C4] mb-4">Your daily adventurer bounty:</p>

              <div className="space-y-2 mb-4">
                <div className="bg-[#14233D] p-2 rounded border border-gold/30 flex justify-between items-center text-xs font-pixel">
                  <span className="text-blue">XP Bonus:</span>
                  <span className="text-gold">+{reward.xp} XP</span>
                </div>
                <div className="bg-[#14233D] p-2 rounded border border-gold/30 flex justify-between items-center text-xs font-pixel">
                  <span className="text-blue">Gold Coins:</span>
                  <span className="text-gold">+{reward.coins} Coins</span>
                </div>
                <div className="bg-[#14233D] p-2 rounded border border-gold/30 flex justify-between items-center text-xs font-pixel">
                  <span className="text-blue">Attribute Boost:</span>
                  <span className="text-[#4CAF50]">+{reward.attributePoints} {reward.attribute}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReward(null)}
                className="w-full py-2 bg-gold text-[#3A2400] font-pixel text-[9px] rounded shadow-glow font-bold active:scale-95"
              >
                Claim Bounty
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
