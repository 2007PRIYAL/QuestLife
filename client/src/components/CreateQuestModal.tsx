import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { PixelPanel } from './PixelPanel';
import { PixelButton } from './PixelButton';
import { ErrorBanner } from './ErrorBanner';
import { createQuestRequest } from '@/api/quests';
import { getApiErrorMessage } from '@/api/client';
import { QUEST_TYPE_LABEL } from '@/utils/quests';
import type { CreateQuestInput, Quest, QuestCategory, QuestType } from '@/types';

interface CreateQuestModalProps {
  onClose: () => void;
  onCreated: (quest: Quest) => void;
}

// Field set is a 1:1 match with server/src/schemas/quest.schema.ts →
// createQuestSchema. Nothing here is invented: title, description, type,
// category, map_index, is_recurring — that's the whole contract.
const QUEST_TYPES: QuestType[] = ['MAIN', 'SIDE', 'MINI'];
const QUEST_CATEGORIES: QuestCategory[] = ['HEALTH', 'STRENGTH', 'INTELLIGENCE', 'WISDOM', 'AGILITY'];

export const CreateQuestModal = ({ onClose, onCreated }: CreateQuestModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<QuestType>('MAIN');
  const [category, setCategory] = useState<QuestCategory>('HEALTH');
  const [mapIndex, setMapIndex] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [justCreated, setJustCreated] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Give your quest a title.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const payload: CreateQuestInput = {
        title: title.trim(),
        type,
        category,
        map_index: mapIndex,
        is_recurring: isRecurring,
      };
      if (description.trim()) payload.description = description.trim();

      const quest = await createQuestRequest(payload);
      setJustCreated(true);
      onCreated(quest);
      // Brief success flash before closing, so the "+" action feels
      // rewarding rather than instantly vanishing.
      setTimeout(onClose, 700);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create that quest.'));
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 px-0 sm:px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-quest-heading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-[430px] max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <PixelPanel tone="gold" className="p-5 rounded-b-none sm:rounded-b-[4px]">
          <div className="flex items-center justify-between mb-4">
            <h1 id="create-quest-heading" className="font-pixel text-[13px] text-gold text-shadow-pixel">
              New Quest
            </h1>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-pixel bg-[#0E1B2E] pixel-border text-white"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {justCreated ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-b from-gold to-[#B8860B] border-2 border-black shadow-glow flex items-center justify-center">
                <Sparkles size={26} className="text-[#3A2400]" aria-hidden="true" />
              </div>
              <p className="font-pixel text-[11px] text-gold">Quest Added!</p>
              <p className="text-xs text-[#8CA6C4]">Your new adventure awaits.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              <label className="block">
                <span className="text-xs text-[#8CA6C4] mb-1 block">Title</span>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Do 20 push-ups"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0E1B2E] border-2 border-black rounded-pixel px-3 py-2.5 text-white placeholder:text-[#5C7A9E] outline-none text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs text-[#8CA6C4] mb-1 block">Description (optional)</span>
                <textarea
                  maxLength={2000}
                  rows={2}
                  placeholder="Any extra detail for future-you"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0E1B2E] border-2 border-black rounded-pixel px-3 py-2.5 text-white placeholder:text-[#5C7A9E] outline-none text-sm resize-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-[#8CA6C4] mb-1 block">Type</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as QuestType)}
                    className="w-full bg-[#0E1B2E] border-2 border-black rounded-pixel px-2 py-2.5 text-white outline-none text-sm"
                  >
                    {QUEST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {QUEST_TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs text-[#8CA6C4] mb-1 block">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as QuestCategory)}
                    className="w-full bg-[#0E1B2E] border-2 border-black rounded-pixel px-2 py-2.5 text-white outline-none text-sm"
                  >
                    {QUEST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs text-[#8CA6C4] mb-1 block">
                  World map location (1 = start, 10 = furthest)
                </span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={mapIndex}
                  onChange={(e) => setMapIndex(Number(e.target.value))}
                  className="w-full accent-gold"
                />
                <span className="text-[10px] text-[#5C7A9E]">Tier {mapIndex}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#8CA6C4]">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="accent-gold w-4 h-4"
                />
                Repeat this quest daily
              </label>

              {error && <ErrorBanner message={error} />}

              <PixelButton type="submit" variant="gold" disabled={isSubmitting} className="mt-1">
                {isSubmitting ? 'Creating...' : 'Create Quest'}
              </PixelButton>
            </form>
          )}
        </PixelPanel>
      </motion.div>
    </motion.div>
  );
};
