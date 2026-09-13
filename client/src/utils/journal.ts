// Daily mood & reflection journal with local storage history and wisdom progression.

export type MoodType = 'happy' | 'calm' | 'neutral' | 'stressed' | 'sad';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mood: MoodType;
  reflection: string;
}

const JOURNAL_KEY = 'questlife_v2_journal_entries';

export const MOOD_DETAILS: Record<
  MoodType,
  { label: string; emoji: string; color: string; bg: string }
> = {
  happy: { label: 'Triumphant', emoji: '😄', color: '#FBBF24', bg: 'bg-[#FBBF24]/20' },
  calm: { label: 'Centered', emoji: '🧘', color: '#38BDF8', bg: 'bg-[#38BDF8]/20' },
  neutral: { label: 'Resolute', emoji: '😐', color: '#94A3B8', bg: 'bg-[#94A3B8]/20' },
  stressed: { label: 'Weary', emoji: '😰', color: '#FB923C', bg: 'bg-[#FB923C]/20' },
  sad: { label: 'Bruised', emoji: '😢', color: '#818CF8', bg: 'bg-[#818CF8]/20' },
};

export const getJournalEntries = (): JournalEntry[] => {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getTodayJournalEntry = (): JournalEntry | undefined => {
  const today = new Date().toISOString().split('T')[0];
  const entries = getJournalEntries();
  return entries.find((e) => e.date === today);
};

export const saveJournalEntry = (mood: MoodType, reflection: string): JournalEntry => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const entries = getJournalEntries();
  const existingIdx = entries.findIndex((e) => e.date === today);

  const entry: JournalEntry = {
    id: existingIdx >= 0 ? entries[existingIdx].id : `journal-${Date.now()}`,
    date: today,
    time,
    mood,
    reflection,
  };

  if (existingIdx >= 0) {
    entries[existingIdx] = entry;
  } else {
    entries.unshift(entry);
  }

  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  } catch {}

  return entry;
};

export const getJournalStreak = (): number => {
  const entries = getJournalEntries();
  if (entries.length === 0) return 0;

  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  let curr = new Date();

  // If today isn't logged yet, check starting from yesterday
  const todayStr = curr.toISOString().split('T')[0];
  if (!dates.has(todayStr)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const dStr = curr.toISOString().split('T')[0];
    if (dates.has(dStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
