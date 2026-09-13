import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Check } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';
import { PixelPanel } from '@/components/PixelPanel';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import { fetchProfile, updateProfileRequest } from '@/api/profile';
import { getApiErrorMessage } from '@/api/client';
import { CHARACTERS, NEEDS_CHARACTER_SELECTION } from '@/utils/characters';
import heroScene from '@/assets/images/hero-scene.jpg';

export const CharacterSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  // `?next=` lets Settings send the user here to change their character
  // and come back, instead of always dropping them on the Dashboard.
  const next = searchParams.get('next') || '/dashboard';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchProfile();
        if (cancelled) return;
        if (!NEEDS_CHARACTER_SELECTION(profile.avatar_url)) {
          setSelectedId(profile.avatar_url);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load your profile.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    setError('');
    try {
      // The ONLY backend call this screen makes: PATCH /api/profile with
      // the existing, unmodified `avatar_url` field.
      await updateProfileRequest({ avatar_url: selectedId });
      await refreshUser();
      navigate(next);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save your character. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <LoadingScreen label="Summoning heroes..." />
      </div>
    );
  }

  return (
    <div className="app-shell relative overflow-hidden">
      <img
        src={heroScene}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b14]/70 via-[#081220]/90 to-[#081220]" />

      <div className="relative flex-1 flex flex-col px-5 pt-10 pb-6 min-h-[100dvh]">
        <motion.div
          className="flex flex-col items-center text-center gap-2 mb-6"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Swords size={20} className="text-blue" aria-hidden="true" />
            <span className="font-pixel text-[11px] text-blue">QuestLife</span>
          </div>
          <h1 className="font-pixel text-lg text-gold text-shadow-pixel">Choose Your Hero</h1>
          <p className="text-xs text-[#8CA6C4] max-w-[280px]">
            Your character is your face in this world. You can change it later in Settings.
          </p>
        </motion.div>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} />
          </div>
        )}

        <div className="flex-1 grid grid-cols-2 gap-3 content-start">
          {CHARACTERS.map((character, i) => {
            const Icon = character.icon;
            const isSelected = selectedId === character.id;
            return (
              <motion.button
                key={character.id}
                type="button"
                onClick={() => setSelectedId(character.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={isSelected}
                className="text-left"
              >
                <PixelPanel
                  tone={isSelected ? 'gold' : 'blue'}
                  className={[
                    'p-3 flex flex-col items-center gap-2 relative bg-gradient-to-b',
                    character.gradient,
                  ].join(' ')}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold border-2 border-black flex items-center justify-center">
                      <Check size={11} className="text-[#3A2400]" aria-hidden="true" />
                    </span>
                  )}
                  <div
                    className="w-16 h-16 rounded-pixel border-2 border-black flex items-center justify-center"
                    style={{ backgroundColor: `${character.color}22` }}
                  >
                    <Icon size={30} style={{ color: character.color }} aria-hidden="true" />
                  </div>
                  <p className="font-pixel text-[10px] text-white">{character.name}</p>
                  <p className="text-[9px] text-[#8CA6C4] text-center leading-snug">
                    {character.title}
                  </p>
                </PixelPanel>
              </motion.button>
            );
          })}
        </div>

        {selectedId && (
          <motion.p
            key={selectedId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs italic text-[#8CA6C4] my-4"
          >
            &ldquo;{CHARACTERS.find((c) => c.id === selectedId)?.description}&rdquo;
          </motion.p>
        )}

        <PixelButton
          variant="gold"
          disabled={!selectedId || isSaving}
          onClick={handleConfirm}
          className="mt-2"
        >
          {isSaving ? 'Entering the world...' : 'Begin Adventure →'}
        </PixelButton>
      </div>
    </div>
  );
};
