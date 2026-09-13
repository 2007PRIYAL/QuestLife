import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Castle, Lock, Waves, Swords, CheckCircle2, Trees, Flame, Compass, Sparkles, X } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { WorldScene, MAP_HEIGHT } from '@/components/WorldScene';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { CreateQuestModal } from '@/components/CreateQuestModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { fetchProfile } from '@/api/profile';
import { fetchQuests } from '@/api/quests';
import { getApiErrorMessage } from '@/api/client';
import { CATEGORY_ICON } from '@/utils/quests';
import type { Profile, Quest } from '@/types';

export const getTierRequiredLevel = (tier: number): number => {
  if (tier <= 3) return 1;
  if (tier <= 6) return 3;
  if (tier <= 8) return 5;
  return 8;
};

interface QuestMarker {
  id: string;
  label: string;
  sub?: string;
  topPercent: number;
  left: string;
  icon: typeof Swords;
  state: 'current' | 'active' | 'cleared' | 'locked';
  requiredLevel: number;
  onClick: () => void;
}

interface DecorativeMarker {
  id: string;
  label: string;
  lore: string;
  sub?: string;
  topPercent: number;
  left: string;
  requiredLevel: number;
  icon: typeof Castle;
  unlockedIcon: typeof Castle;
}

const REGION_LANDMARKS: DecorativeMarker[] = [
  {
    id: 'lake',
    label: 'Lake Whispers',
    lore: 'Peaceful turquoise waters where novice adventurers take their first vows.',
    topPercent: 92,
    left: '78%',
    requiredLevel: 1,
    icon: Waves,
    unlockedIcon: Waves,
  },
  {
    id: 'dark-woods',
    label: 'Dark Woods',
    lore: 'Enchanted old-growth pines guarded by roaring waterfalls and ancient bridges.',
    topPercent: 62,
    left: '84%',
    requiredLevel: 3,
    icon: Lock,
    unlockedIcon: Trees,
  },
  {
    id: 'dragon-peaks',
    label: 'Dragon Peaks',
    lore: 'Treacherous crags and hanging rope bridges surrounding the wyrm’s fiery lair.',
    topPercent: 38,
    left: '84%',
    requiredLevel: 5,
    icon: Lock,
    unlockedIcon: Flame,
  },
  {
    id: 'castle',
    label: 'High Citadel',
    lore: 'The sovereign realm fortress, shining under cosmic starlight and astral beacon.',
    topPercent: 7,
    left: '50%',
    requiredLevel: 8,
    icon: Lock,
    unlockedIcon: Castle,
  },
];

export const WorldMap = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState<DecorativeMarker | null>(null);

  const scrollToCurrentQuest = () => {
    const target = questMarkers.find((m) => m.state === 'current') || questMarkers[0];
    if (target && scrollRef.current) {
      const targetScroll = (target.topPercent / 100) * MAP_HEIGHT - scrollRef.current.clientHeight / 2;
      scrollRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  };

  const load = async () => {
    try {
      const [profileData, questsData] = await Promise.all([fetchProfile(), fetchQuests()]);
      setProfile(profileData);
      setQuests(questsData.filter((q) => !q.is_archived));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load the world map.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!isLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isLoading]);

  const userLevel = profile?.level ?? 1;

  const currentRegion = useMemo(() => {
    if (userLevel >= 8) return { title: 'High Castle Citadel', world: 'World 1 • Region 4' };
    if (userLevel >= 5) return { title: 'Dragon Peaks', world: 'World 1 • Region 3' };
    if (userLevel >= 3) return { title: 'Dark Woods', world: 'World 1 • Region 2' };
    return { title: 'Green Meadows', world: 'World 1 • Region 1' };
  }, [userLevel]);

  // Group real quests by map_index and apply level unlocking
  const questMarkers: QuestMarker[] = useMemo(() => {
    const tiers = new Map<number, Quest[]>();
    quests.forEach((quest) => {
      const tier = quest.map_index ?? 1;
      if (!tiers.has(tier)) tiers.set(tier, []);
      tiers.get(tier)!.push(quest);
    });

    const sortedTiers = [...tiers.keys()].sort((a, b) => a - b);
    const lowestIncompleteTier = sortedTiers.find(
      (tier) =>
        userLevel >= getTierRequiredLevel(tier) &&
        tiers.get(tier)!.some((q) => !q.completed_today),
    );

    const leftPositions = ['52%', '22%', '74%', '38%', '62%'];

    return sortedTiers.map((tier, i) => {
      const questsInTier = tiers.get(tier)!;
      const requiredLevel = getTierRequiredLevel(tier);
      const isLocked = userLevel < requiredLevel;
      const allDone = questsInTier.every((q) => Boolean(q.completed_today));

      let state: QuestMarker['state'] = 'active';
      if (isLocked) {
        state = 'locked';
      } else if (allDone) {
        state = 'cleared';
      } else if (tier === lowestIncompleteTier) {
        state = 'current';
      }

      const representative = questsInTier[0];
      return {
        id: `tier-${tier}`,
        label: questsInTier.length === 1 ? representative.title : `${questsInTier.length} Quests`,
        sub: isLocked ? `Req. Lv. ${requiredLevel}` : `Tier ${tier}`,
        topPercent: 90 - ((tier - 1) / 9) * 76,
        left: leftPositions[i % leftPositions.length],
        icon: isLocked ? Lock : CATEGORY_ICON[representative.category],
        state,
        requiredLevel,
        onClick: () => {
          if (isLocked) {
            setError(`Tier ${tier} is locked! Reach Level ${requiredLevel} to explore this region.`);
            return;
          }
          navigate('/quests');
        },
      };
    });
  }, [quests, userLevel, navigate]);

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Charting the world map..." />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      {error && (
        <div className="p-3">
          <ErrorBanner message={error} />
        </div>
      )}

      <motion.div
        className="mx-4 mt-3 pixel-border bg-[#0E1B2E]/90 rounded-pixel px-4 py-3 text-center relative overflow-hidden"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-pixel text-[7px] text-blue mb-1">{currentRegion.world}</p>
        <h1 className="font-pixel text-[13px] text-gold text-shadow-pixel">{currentRegion.title}</h1>
        <p className="text-[10px] text-[#8CA6C4] mt-1">
          Lv. {userLevel} Adventurer • Scroll to explore. Tap pins for quests & landmarks.
        </p>
      </motion.div>

      {/* Active Landmark Lore Popup Card */}
      {activeLandmark && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="mx-4 mt-2 p-2.5 bg-[#0A1628]/95 border-2 border-gold/70 rounded-pixel shadow-glow flex items-start justify-between gap-2.5 z-20"
        >
          <div className="flex items-start gap-2.5">
            <span className="p-1.5 bg-[#14233D] rounded border border-gold/40 text-gold shrink-0">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-pixel text-[9px] text-gold">{activeLandmark.label}</h3>
                <span className="text-[7px] font-pixel text-blue">
                  {userLevel >= activeLandmark.requiredLevel ? '• Unlocked' : `• Req. Lv. ${activeLandmark.requiredLevel}`}
                </span>
              </div>
              <p className="text-[9px] text-[#A0B7D0] leading-snug mt-1">{activeLandmark.lore}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveLandmark(null)}
            className="text-gray-400 hover:text-white p-1 shrink-0"
            title="Close"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Scrollable map viewport — independent scroll region so the top
          bar and bottom nav stay pinned while the world scrolls. */}
      <div
        ref={scrollRef}
        className="relative mt-3 overflow-y-auto overscroll-contain"
        style={{ height: 'calc(100dvh - 232px)' }}
      >
        <div className="relative" style={{ height: MAP_HEIGHT, width: '100%' }}>
          <WorldScene className="absolute inset-0 w-full h-full" />

          {REGION_LANDMARKS.map((marker, i) => {
            const isUnlocked = userLevel >= marker.requiredLevel;
            const Icon = isUnlocked ? marker.unlockedIcon : marker.icon;
            const subText = isUnlocked
              ? marker.requiredLevel > 1
                ? `(Lv. ${marker.requiredLevel})`
                : ''
              : `(Lv. ${marker.requiredLevel})`;
            return (
              <motion.button
                key={marker.id}
                type="button"
                onClick={() => {
                  setActiveLandmark(marker);
                  if (!isUnlocked) {
                    setError(`${marker.label} is locked! Reach Level ${marker.requiredLevel} to unlock this biome.`);
                  }
                }}
                style={{ top: `${marker.topPercent}%`, left: marker.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 + i * 0.08 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
              >
                <span
                  className={[
                    'relative w-11 h-11 rounded-pixel border-2 border-black flex items-center justify-center transition-all',
                    isUnlocked
                      ? 'bg-[#0E1B2E] text-gold shadow-glow hover:border-gold'
                      : 'bg-[#1a1a1a] text-[#5C7A9E] opacity-80',
                  ].join(' ')}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="font-pixel text-[7px] text-white bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap shadow">
                  {marker.label}
                  {subText ? ` ${subText}` : ''}
                </span>
              </motion.button>
            );
          })}

          {questMarkers.map((marker, i) => {
            const Icon =
              marker.state === 'locked'
                ? Lock
                : marker.state === 'cleared'
                  ? CheckCircle2
                  : marker.icon;
            return (
              <motion.button
                key={marker.id}
                type="button"
                onClick={marker.onClick}
                style={{ top: `${marker.topPercent}%`, left: marker.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 + i * 0.08 }}
                whileHover={marker.state !== 'locked' ? { scale: 1.08 } : undefined}
                whileTap={marker.state !== 'locked' ? { scale: 0.94 } : undefined}
              >
                <span
                  className={[
                    'relative w-11 h-11 rounded-pixel border-2 border-black flex items-center justify-center',
                    marker.state === 'locked'
                      ? 'bg-[#1a1a1a] text-[#5C7A9E] opacity-75'
                      : marker.state === 'cleared'
                        ? 'bg-green text-[#0B2411]'
                        : 'bg-gold text-[#3A2400] shadow-glow',
                  ].join(' ')}
                >
                  {marker.state === 'current' && (
                    <motion.span
                      className="absolute inset-0 rounded-pixel bg-gold"
                      aria-hidden="true"
                      animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.35, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <motion.span
                    className="relative"
                    animate={marker.state === 'current' || marker.state === 'active' ? { y: [0, -3, 0] } : undefined}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </motion.span>
                </span>
                <span className="font-pixel text-[7px] text-white bg-black/70 px-1.5 py-0.5 rounded whitespace-nowrap max-w-[90px] truncate">
                  {marker.label}
                </span>
                {marker.state === 'locked' && (
                  <span className="font-pixel text-[6px] text-[#FF4B4B] bg-black/80 px-1 py-0.5 rounded">
                    {marker.sub}
                  </span>
                )}
              </motion.button>
            );
          })}

          {questMarkers.length === 0 && (
            <div className="absolute inset-x-6 top-8 text-center">
              <p className="font-pixel text-[9px] text-[#8CA6C4] leading-relaxed">
                No quests placed on the map yet.
                <br />
                Tap + to create your first one.
              </p>
            </div>
          )}
        </div>
      </div>

      {questMarkers.length > 0 && (
        <motion.button
          type="button"
          onClick={scrollToCurrentQuest}
          className="fixed bottom-24 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0E1B2E]/95 border-2 border-gold rounded-pixel shadow-glow text-gold text-[7px] font-pixel active:scale-95 cursor-pointer backdrop-blur-sm"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          title="Scroll to next available quest"
        >
          <Compass size={13} className="text-blue" />
          <span>Next Quest</span>
        </motion.button>
      )}

      <FloatingActionButton label="Create new quest" onClick={() => setIsCreateOpen(true)} />

      <BottomNav />

      {isCreateOpen && (
        <CreateQuestModal onClose={() => setIsCreateOpen(false)} onCreated={() => load()} />
      )}
    </div>
  );
};
