import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Dumbbell,
  BookOpen,
  Sparkles,
  Droplet,
  Wind,
  Moon,
  X,
  PlusCircle,
  Zap,
} from 'lucide-react';
import { createQuestRequest } from '@/api/quests';
import type { QuestType, QuestCategory } from '@/types';

interface SmartGoalPreset {
  id: string;
  name: string;
  category: QuestCategory;
  type: QuestType;
  icon: typeof Brain;
  color: string;
  bg: string;
  defaultTitle: string;
  defaultDescription: string;
  mapIndex: number;
}

const PRESETS: SmartGoalPreset[] = [
  {
    id: 'study',
    name: 'Study',
    category: 'INTELLIGENCE',
    type: 'SIDE',
    icon: Brain,
    color: '#4DA6FF',
    bg: 'bg-[#4DA6FF]/15',
    defaultTitle: 'Study & Mental Focus Session',
    defaultDescription: 'Dedicate 45 minutes to focused academic learning or deep work.',
    mapIndex: 3,
  },
  {
    id: 'gym',
    name: 'Gym / Workout',
    category: 'STRENGTH',
    type: 'MAIN',
    icon: Dumbbell,
    color: '#FF9F4D',
    bg: 'bg-[#FF9F4D]/15',
    defaultTitle: 'Iron Forge: Physical Training',
    defaultDescription: 'Complete today’s strength training session at the iron gym.',
    mapIndex: 4,
  },
  {
    id: 'reading',
    name: 'Reading',
    category: 'WISDOM',
    type: 'MINI',
    icon: BookOpen,
    color: '#B983FF',
    bg: 'bg-[#B983FF]/15',
    defaultTitle: 'Grimoire Reading: 20 Pages',
    defaultDescription: 'Read 20 pages from a book to expand wisdom and perspective.',
    mapIndex: 2,
  },
  {
    id: 'meditation',
    name: 'Meditation',
    category: 'WISDOM',
    type: 'MINI',
    icon: Sparkles,
    color: '#FCD34D',
    bg: 'bg-[#FCD34D]/15',
    defaultTitle: 'Mindful Sanctuary: 10m Meditation',
    defaultDescription: 'Practice 10 minutes of still breathing to calm internal chaos.',
    mapIndex: 1,
  },
  {
    id: 'coding',
    name: 'Coding',
    category: 'INTELLIGENCE',
    type: 'MAIN',
    icon: Zap,
    color: '#38BDF8',
    bg: 'bg-[#38BDF8]/15',
    defaultTitle: 'Code Craft: Build & Ship Feature',
    defaultDescription: 'Write clean code, solve bugs, and advance technical project.',
    mapIndex: 5,
  },
  {
    id: 'water',
    name: 'Water Intake',
    category: 'HEALTH',
    type: 'MINI',
    icon: Droplet,
    color: '#0284C7',
    bg: 'bg-[#0284C7]/15',
    defaultTitle: 'Elixir of Life: Drink 2L Water',
    defaultDescription: 'Stay properly hydrated throughout the day for vitality.',
    mapIndex: 1,
  },
  {
    id: 'walking',
    name: 'Walking / Cardio',
    category: 'AGILITY',
    type: 'SIDE',
    icon: Wind,
    color: '#4CAF50',
    bg: 'bg-[#4CAF50]/15',
    defaultTitle: 'Ranger’s Patrol: 6,000 Steps',
    defaultDescription: 'Take an invigorating walk to sharpen agility and stamina.',
    mapIndex: 2,
  },
  {
    id: 'sleep',
    name: 'Sleep Rest',
    category: 'HEALTH',
    type: 'SIDE',
    icon: Moon,
    color: '#818CF8',
    bg: 'bg-[#818CF8]/15',
    defaultTitle: 'Restful Slumber: 8 Hours Sleep',
    defaultDescription: 'Get into bed on schedule to fully recharge hero mana.',
    mapIndex: 1,
  },
];

interface SmartQuestModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const SmartQuestModal = ({ onClose, onCreated }: SmartQuestModalProps) => {
  const [selectedPreset, setSelectedPreset] = useState<SmartGoalPreset>(PRESETS[0]);
  const [title, setTitle] = useState(PRESETS[0].defaultTitle);
  const [description, setDescription] = useState(PRESETS[0].defaultDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPreset = (p: SmartGoalPreset) => {
    setSelectedPreset(p);
    setTitle(p.defaultTitle);
    setDescription(p.defaultDescription);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please provide a title for the quest.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createQuestRequest({
        title: title.trim(),
        description: description.trim(),
        type: selectedPreset.type,
        category: selectedPreset.category,
        map_index: selectedPreset.mapIndex,
      });

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate quest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="pixel-border-gold bg-[#0E1B2E] p-4.5 max-w-sm w-full rounded-pixel relative shadow-glow"
      >
        <div className="flex items-center justify-between pb-3 border-b border-black">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-gold/20 rounded border border-gold/40 text-gold">
              <Sparkles size={16} />
            </span>
            <h2 className="font-pixel text-[11px] text-gold">SMART QUEST PLANNER</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[10px] text-[#8CA6C4] my-2.5">
          Select a real-life goal to generate a calibrated RPG quest:
        </p>

        {/* Goal Preset Chips */}
        <div className="grid grid-cols-4 gap-1.5 mb-3.5">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={[
                  'flex flex-col items-center gap-1 p-1.5 rounded-pixel border transition-all cursor-pointer',
                  isSelected
                    ? 'border-gold bg-gold/20 shadow-glow text-white'
                    : 'border-[#1E293B] bg-[#14233D] text-[#8CA6C4] hover:text-white',
                ].join(' ')}
              >
                <span
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ color: preset.color, backgroundColor: `${preset.color}20` }}
                >
                  <Icon size={14} />
                </span>
                <span className="font-pixel text-[6px] truncate w-full text-center">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quest Customization */}
        <div className="space-y-2.5 bg-[#14233D] p-3 rounded-pixel border border-black mb-3">
          <div>
            <label className="block font-pixel text-[7px] text-blue mb-1">Quest Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#081220] text-white px-2.5 py-1.5 rounded border border-[#334155] text-xs"
            />
          </div>

          <div>
            <label className="block font-pixel text-[7px] text-blue mb-1">Description / Goal</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#081220] text-white px-2.5 py-1.5 rounded border border-[#334155] text-xs"
            />
          </div>

          {/* Reward Preview */}
          <div className="pt-1 flex items-center justify-between font-pixel text-[7px] text-[#A5B4FC]">
            <span>Type: {selectedPreset.type}</span>
            <span>Category: {selectedPreset.category}</span>
            <span className="text-gold">
              {selectedPreset.type === 'MAIN'
                ? '+100 XP'
                : selectedPreset.type === 'SIDE'
                  ? '+60 XP'
                  : '+30 XP'}
            </span>
          </div>
        </div>

        {error && (
          <p className="font-pixel text-[7px] text-[#FF4B4B] mb-2.5 text-center">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 font-pixel text-[8px] text-gray-400 hover:text-white bg-[#14233D] rounded border border-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting}
            className="flex-1 py-2 font-pixel text-[8px] bg-gold text-[#3A2400] font-bold rounded shadow-glow active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Forging...' : 'Generate Quest'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
