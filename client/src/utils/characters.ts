import { Ghost, Sparkles, Wind, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Character selection is a purely cosmetic, client-side concept layered on
// top of the ONE backend field that actually supports storing a choice:
// `profiles.avatar_url` (see server/src/schemas/profile.schema.ts — it's a
// free-form string, max 255 chars, updatable via `PATCH /api/profile`).
// No backend schema or route was added or changed to support this; we're
// just writing one of these four slugs into an existing column.
export interface CharacterOption {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}

export const CHARACTERS: CharacterOption[] = [
  {
    id: 'char-nox',
    name: 'Nox',
    title: 'Shadow Adventurer',
    description: 'Quiet, focused, relentless. Nox turns discipline into momentum.',
    icon: Ghost,
    color: '#B983FF',
    gradient: 'from-[#2A1F4D] to-[#120B26]',
  },
  {
    id: 'char-nova',
    name: 'Nova',
    title: 'Arcane Scholar',
    description: 'Curious and sharp. Nova levels up the mind as fast as the body.',
    icon: Sparkles,
    color: '#FFD93D',
    gradient: 'from-[#4D3A0E] to-[#241A05]',
  },
  {
    id: 'char-kai',
    name: 'Kai',
    title: 'Swift Ranger',
    description: 'Fast, light on their feet, always moving toward the next goal.',
    icon: Wind,
    color: '#4CAF50',
    gradient: 'from-[#173A22] to-[#0B200F]',
  },
  {
    id: 'char-echo',
    name: 'Echo',
    title: 'Tidal Wanderer',
    description: 'Calm and steady. Echo builds habits like the tide builds shorelines.',
    icon: Waves,
    color: '#4DA6FF',
    gradient: 'from-[#0E2A4D] to-[#081527]',
  },
];

// The backend seeds every new profile's avatar_url with the DB column
// default 'hero-default' (see migrations/001_initial_schema.sql) and
// never sets it during registration (server/src/services/auth.service.ts).
// We treat that default — or a missing value — as "no character chosen yet".
export const NEEDS_CHARACTER_SELECTION = (avatarUrl: string | null | undefined): boolean => {
  return !avatarUrl || avatarUrl === 'hero-default';
};

export const getCharacterById = (id: string | null | undefined): CharacterOption | undefined => {
  return CHARACTERS.find((c) => c.id === id);
};
