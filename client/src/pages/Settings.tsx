import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  User,
  Palette,
  Bell,
  Music,
  LogOut,
  Sparkles,
  Globe2,
  Clock,
  Volume2,
} from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { PixelPanel } from '@/components/PixelPanel';
import { PixelButton } from '@/components/PixelButton';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useAuth } from '@/context/AuthContext';
import { fetchProfile, updateProfileRequest } from '@/api/profile';
import { getApiErrorMessage } from '@/api/client';
import { getCharacterById } from '@/utils/characters';
import { getCharacterEvolution } from '@/utils/characterEvolution';
import { getNotificationsPref, setNotificationsPref } from '@/utils/localSettings';
import type { Profile } from '@/types';

const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
];

export const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSavingTimezone, setIsSavingTimezone] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [focusRemindersEnabled, setFocusRemindersEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const userId = user?.id ?? '';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProfile();
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load your settings.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (userId) {
      setNotificationsEnabled(getNotificationsPref(userId));
      try {
        const focusVal = localStorage.getItem(`questlife_focus_pref_${userId}`);
        if (focusVal !== null) setFocusRemindersEnabled(focusVal === 'true');
        const soundVal = localStorage.getItem(`questlife_sound_pref_${userId}`);
        if (soundVal !== null) setSoundEnabled(soundVal === 'true');
      } catch {}
    }
  }, [userId]);

  const character = useMemo(() => getCharacterById(profile?.avatar_url), [profile?.avatar_url]);
  const evolution = useMemo(() => (profile ? getCharacterEvolution(profile.level) : null), [profile]);

  const handleTimezoneChange = async (timezone: string) => {
    if (!profile || timezone === profile.timezone) return;
    setIsSavingTimezone(true);
    setError('');
    setSuccessMessage('');
    try {
      const updated = await updateProfileRequest({ timezone });
      setProfile(updated);
      setSuccessMessage('Timezone updated successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update your timezone.'));
    } finally {
      setIsSavingTimezone(false);
    }
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (userId) setNotificationsPref(userId, enabled);
  };

  const handleFocusToggle = (enabled: boolean) => {
    setFocusRemindersEnabled(enabled);
    if (userId) {
      try {
        localStorage.setItem(`questlife_focus_pref_${userId}`, String(enabled));
      } catch {}
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    if (userId) {
      try {
        localStorage.setItem(`questlife_sound_pref_${userId}`, String(enabled));
      } catch {}
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Opening the settings scroll..." />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {profile && <TopBar profile={profile} />}

      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-8 h-8 flex items-center justify-center rounded-pixel bg-[#0E1B2E] pixel-border text-white shrink-0 cursor-pointer active:scale-95"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <div>
          <h1 className="font-pixel text-[14px] text-gold text-shadow-pixel">Settings</h1>
          <p className="text-xs text-[#8CA6C4] mt-0.5">Tune your adventure & realm options.</p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8 flex flex-col gap-3.5 overflow-y-auto">
        {error && <ErrorBanner message={error} />}
        {successMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[#4CAF50] font-pixel text-[8px] flex items-center gap-1.5"
          >
            <Sparkles size={12} aria-hidden="true" /> {successMessage}
          </motion.p>
        )}

        {/* Profile & Character Evolution */}
        <PixelPanel tone="blue" className="p-3.5">
          <SectionHeader icon={User} label="Profile & Evolution" />
          <div className="flex items-center gap-3 mt-3">
            <div
              className={[
                'w-12 h-12 rounded-pixel border-2 border-black flex items-center justify-center shrink-0 text-xl',
                evolution?.borderClass,
              ].join(' ')}
              style={{ backgroundColor: `${character?.color || '#FFD93D'}22` }}
            >
              {character?.icon ? (
                <character.icon size={22} style={{ color: character.color }} />
              ) : (
                <span>🧑‍🚀</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs text-white font-pixel truncate">{user?.username}</p>
                <span
                  className={[
                    'font-pixel text-[6px] px-1 py-0.5 rounded border border-black',
                    evolution?.badgeBg,
                  ].join(' ')}
                >
                  {evolution?.badgeLabel}
                </span>
              </div>
              <p className="text-[10px] text-[#8CA6C4] truncate mt-0.5">
                Lv. {profile?.level} • {evolution?.rankTitle}
              </p>
            </div>
          </div>
        </PixelPanel>

        {/* Change Avatar */}
        <PixelPanel tone="blue" className="p-3.5">
          <SectionHeader icon={Palette} label="Hero Roster" />
          <div className="flex items-center gap-3 mt-3">
            {character ? (
              <>
                <div
                  className="w-10 h-10 rounded-pixel border-2 border-black flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${character.color}22` }}
                >
                  <character.icon size={20} style={{ color: character.color }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-pixel truncate">{character.name}</p>
                  <p className="text-[10px] text-[#8CA6C4] truncate">{character.title}</p>
                </div>
              </>
            ) : (
              <p className="flex-1 text-xs text-[#8CA6C4]">No character chosen yet.</p>
            )}
            <PixelButton
              variant="outline"
              fullWidth={false}
              className="text-[8px] py-1.5 px-3 shrink-0"
              onClick={() => navigate('/character-select?next=/settings')}
            >
              Switch Hero
            </PixelButton>
          </div>
        </PixelPanel>

        {/* Timezone (Real Backend Sync) */}
        <PixelPanel tone="blue" className="p-3.5">
          <SectionHeader icon={Globe2} label="Realm Timezone" />
          <p className="text-[10px] text-[#8CA6C4] mt-1 mb-2.5">
            Syncs with backend to calculate exact midnight daily quest reset.
          </p>
          <select
            value={profile?.timezone ?? 'UTC'}
            disabled={isSavingTimezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-full bg-[#081220] border-2 border-black rounded-pixel px-3 py-2 text-xs text-white outline-none disabled:opacity-60 font-mono"
          >
            {!COMMON_TIMEZONES.includes(profile?.timezone ?? 'UTC') && profile?.timezone && (
              <option value={profile.timezone}>{profile.timezone}</option>
            )}
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </PixelPanel>

        {/* Notification Preferences */}
        <PixelPanel tone="blue" className="p-3.5">
          <SectionHeader icon={Bell} label="Quest Reminders" />
          <div className="flex items-center justify-between mt-2.5">
            <div>
              <p className="text-xs text-white">Daily Quest Reminders</p>
              <p className="text-[9px] text-[#5C7A9E] mt-0.5">Alerts before midnight reset.</p>
            </div>
            <ToggleSwitch
              checked={notificationsEnabled}
              onChange={handleNotificationsToggle}
              label="Daily quest reminders"
            />
          </div>
        </PixelPanel>

        {/* Focus Reminders */}
        <PixelPanel tone="blue" className="p-3.5">
          <SectionHeader icon={Clock} label="Focus Alerts" />
          <div className="flex items-center justify-between mt-2.5">
            <div>
              <p className="text-xs text-white">Pomodoro Break Reminders</p>
              <p className="text-[9px] text-[#5C7A9E] mt-0.5">Chimes when focus interval ends.</p>
            </div>
            <ToggleSwitch
              checked={focusRemindersEnabled}
              onChange={handleFocusToggle}
              label="Pomodoro break reminders"
            />
          </div>
        </PixelPanel>

        {/* Audio / Sound FX */}
        <PixelPanel tone="blue" className="p-3.5">
          <SectionHeader icon={Volume2} label="Chiptune Audio" />
          <div className="flex items-center justify-between mt-2.5">
            <div>
              <p className="text-xs text-white">Quest Completion Chimes</p>
              <p className="text-[9px] text-[#5C7A9E] mt-0.5">Retro 16-bit celebration feedback.</p>
            </div>
            <ToggleSwitch
              checked={soundEnabled}
              onChange={handleSoundToggle}
              label="Quest completion chimes"
            />
          </div>
        </PixelPanel>

        {/* Theme */}
        <PixelPanel tone="blue" className="p-3.5">
          <SectionHeader icon={Palette} label="Theme" />
          <div className="flex items-center justify-between mt-2.5">
            <div>
              <p className="text-xs text-white">Midnight Dungeon</p>
              <p className="text-[9px] text-[#5C7A9E] mt-0.5">Default 16-bit RPG theme.</p>
            </div>
            <span className="font-pixel text-[7px] text-gold bg-[#081220] border border-black rounded-pixel px-2 py-1">
              Active
            </span>
          </div>
        </PixelPanel>

        <PixelButton
          variant="dark"
          icon={<LogOut size={15} aria-hidden="true" />}
          onClick={handleLogout}
          className="mt-1 !text-red !border-red cursor-pointer"
        >
          Log Out of Realm
        </PixelButton>
      </div>

      <BottomNav />
    </div>
  );
};

const SectionHeader = ({ icon: Icon, label }: { icon: typeof User; label: string }) => (
  <div className="flex items-center gap-2">
    <Icon size={14} className="text-blue" aria-hidden="true" />
    <h2 className="font-pixel text-[9px] text-white">{label}</h2>
  </div>
);
