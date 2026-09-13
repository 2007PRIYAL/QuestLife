import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Send, Flame, History, Check } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { fetchProfile } from '@/api/profile';
import {
  MoodType,
  JournalEntry,
  MOOD_DETAILS,
  getJournalEntries,
  getTodayJournalEntry,
  saveJournalEntry,
  getJournalStreak,
} from '@/utils/journal';
import type { Profile } from '@/types';

export const Journal = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mood, setMood] = useState<MoodType>('calm');
  const [reflection, setReflection] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const p = await fetchProfile();
        setProfile(p);
      } catch {
        setError('Could not load adventurer profile.');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    const existingToday = getTodayJournalEntry();
    if (existingToday) {
      setMood(existingToday.mood);
      setReflection(existingToday.reflection);
    }
    setEntries(getJournalEntries());
    setStreak(getJournalStreak());
  }, []);

  const handleSave = () => {
    if (!reflection.trim()) return;
    saveJournalEntry(mood, reflection.trim());
    setEntries(getJournalEntries());
    const nextStreak = getJournalStreak();
    setStreak(nextStreak);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Opening Chronicles of Wisdom..." />
      </div>
    );
  }

  const moodList: MoodType[] = ['happy', 'calm', 'neutral', 'stressed', 'sad'];

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      {error && (
        <div className="p-3">
          <ErrorBanner message={error} />
        </div>
      )}

      <main className="flex-1 px-4 py-3.5 space-y-4 pb-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-pixel text-[7px] text-blue mb-0.5">CHRONICLES OF WISDOM</p>
            <h1 className="font-pixel text-[13px] text-gold text-shadow-pixel">Daily Mood Journal</h1>
          </div>
          <div className="flex items-center gap-1 font-pixel text-[8px] text-[#A5B4FC] bg-[#6366F1]/15 px-2 py-1 rounded border border-[#6366F1]/40">
            <Flame size={12} className="text-[#FF9F4D]" />
            <span>{streak}d Streak</span>
          </div>
        </div>

        {/* 1. Daily Mood Selection */}
        <div className="pixel-border bg-[#0E1B2E] p-3 rounded-pixel space-y-2">
          <label className="block font-pixel text-[8px] text-gold">
            How fares your spirit today, adventurer?
          </label>

          <div className="grid grid-cols-5 gap-1.5">
            {moodList.map((m) => {
              const details = MOOD_DETAILS[m];
              const isSelected = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={[
                    'flex flex-col items-center gap-1 p-2 rounded-pixel border transition-all cursor-pointer',
                    isSelected
                      ? 'border-gold bg-gold/20 shadow-glow'
                      : 'border-[#1E293B] bg-[#14233D] hover:bg-[#1E3A5F]',
                  ].join(' ')}
                >
                  <span className="text-xl">{details.emoji}</span>
                  <span className="font-pixel text-[6px] text-[#8CA6C4]">
                    {details.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Daily Reflection Entry Area */}
        <div className="pixel-border bg-[#0E1B2E] p-3 rounded-pixel space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="font-pixel text-[8px] text-gold flex items-center gap-1">
              <Sparkles size={12} />
              Chronicle of Today's Trials & Victories
            </label>
            <span className="font-pixel text-[7px] text-[#8CA6C4]">+Wisdom Gain</span>
          </div>

          <textarea
            rows={3}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What lessons did you learn? What dragons did you slay today? Reflect here..."
            className="w-full bg-[#081220] text-white p-2.5 rounded border border-[#334155] text-xs focus:border-gold focus:outline-none"
          />

          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 p-2 bg-[#4CAF50]/20 border border-[#4CAF50] rounded font-pixel text-[7px] text-[#4CAF50]"
            >
              <Check size={12} />
              <span>Reflections committed to the Tome of Wisdom!</span>
            </motion.div>
          )}

          <div className="flex justify-end">
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={!reflection.trim()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={[
                'px-4 py-2 font-pixel text-[8px] rounded border border-black flex items-center gap-1.5 font-bold transition-all',
                reflection.trim()
                  ? 'bg-gold text-[#3A2400] shadow-glow cursor-pointer'
                  : 'bg-[#1E293B] text-[#64748B] cursor-not-allowed',
              ].join(' ')}
            >
              <Send size={11} /> Save Reflection
            </motion.button>
          </div>
        </div>

        {/* 3. Mood History Timeline */}
        <div className="space-y-2">
          <h3 className="font-pixel text-[9px] text-white flex items-center gap-1.5">
            <History size={13} /> Past Chronicles ({entries.length})
          </h3>

          {entries.length === 0 ? (
            <div className="pixel-border bg-[#0E1B2E] p-4 text-center">
              <p className="font-pixel text-[8px] text-[#8CA6C4]">
                The pages of your journal are waiting for their first entry.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const details = MOOD_DETAILS[entry.mood];
                return (
                  <div
                    key={entry.id}
                    className="p-3 bg-[#0E1B2E] border border-black rounded-pixel space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{details.emoji}</span>
                        <span className="font-pixel text-[8px] text-white">
                          {details.label}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-[#8CA6C4]">
                        {entry.date} • {entry.time}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A0B7D0] leading-relaxed pl-7">
                      "{entry.reflection}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
