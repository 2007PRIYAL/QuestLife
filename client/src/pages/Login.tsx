import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Swords, User, Eye, EyeOff } from 'lucide-react';
import heroScene from '@/assets/images/hero-scene.jpg';
import { PixelButton } from '@/components/PixelButton';
import { PixelPanel } from '@/components/PixelPanel';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/api/client';
import { NEEDS_CHARACTER_SELECTION } from '@/utils/characters';

type Mode = 'login' | 'register';

export const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const currentUser =
        mode === 'login'
          ? await login({ email, password })
          : await register({
              email,
              password,
              username,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            });

      // New heroes (and anyone who never finished picking one) land on
      // Character Selection first; everyone else goes straight to the map.
      if (NEEDS_CHARACTER_SELECTION(currentUser.profile.avatar_url)) {
        navigate('/character-select');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          mode === 'login' ? 'Invalid email or password.' : 'Could not create your account.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell relative">
      <img
        src={heroScene}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-[#081220]/70" />

      <div className="relative flex-1 flex flex-col px-5 pt-10 pb-8 min-h-[100dvh] overflow-y-auto">
        <motion.div
          className="flex flex-col items-center gap-1 mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Swords size={22} className="text-blue" aria-hidden="true" />
            <span className="font-pixel text-lg text-gold text-shadow-pixel">QuestLife</span>
          </div>
          <p className="font-pixel text-[7px] text-blue">Level up your real life</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
        <PixelPanel tone="blue" className="p-5">
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="font-pixel text-[13px] text-gold text-center mb-1"
            >
              {mode === 'login' ? 'Welcome Back, Hero ⚔️' : 'Join the Adventure ⚔️'}
            </motion.h1>
          </AnimatePresence>
          <p className="text-center text-[#8CA6C4] text-xs mb-5">
            {mode === 'login' ? 'Continue your adventure' : 'Create your hero to begin'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
            {mode === 'register' && (
              <label className="block">
                <span className="sr-only">Username</span>
                <div className="flex items-center gap-2 bg-[#0E1B2E] border-2 border-black rounded-pixel px-3 py-3">
                  <User size={16} className="text-[#5C7A9E]" aria-hidden="true" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="^[A-Za-z0-9_-]+$"
                    title="Letters, numbers, underscores and hyphens only"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent flex-1 text-white placeholder:text-[#5C7A9E] outline-none text-sm"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="sr-only">Email</span>
              <div className="flex items-center gap-2 bg-[#0E1B2E] border-2 border-black rounded-pixel px-3 py-3">
                <Mail size={16} className="text-[#5C7A9E]" aria-hidden="true" />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-white placeholder:text-[#5C7A9E] outline-none text-sm"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">Password</span>
              <div className="flex items-center gap-2 bg-[#0E1B2E] border-2 border-black rounded-pixel px-3 py-3">
                <Lock size={16} className="text-[#5C7A9E]" aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-white placeholder:text-[#5C7A9E] outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-[#5C7A9E]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs text-[#8CA6C4] px-0.5">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-blue w-4 h-4"
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  className="text-blue hover:underline"
                  onClick={() => setError('Password reset is not available on this backend yet.')}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && <ErrorBanner message={error} />}

            <PixelButton type="submit" variant="gold" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Please wait...' : mode === 'login' ? '⚔ Login' : '⚔ Create Account'}
            </PixelButton>
          </form>

          <div className="flex items-center gap-3 my-5" aria-hidden="true">
            <div className="flex-1 h-px bg-[#2A3F5C]" />
            <span className="font-pixel text-[8px] text-[#5C7A9E]">OR</span>
            <div className="flex-1 h-px bg-[#2A3F5C]" />
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled
              title="Not available — this backend has no OAuth route"
              className="w-full flex items-center justify-center gap-2 bg-[#0E1B2E] border-2 border-black rounded-pixel py-3 text-sm text-white opacity-50 cursor-not-allowed"
            >
              Continue with Google
            </button>
            <button
              type="button"
              disabled
              title="Not available — this backend has no OAuth route"
              className="w-full flex items-center justify-center gap-2 bg-[#0E1B2E] border-2 border-black rounded-pixel py-3 text-sm text-white opacity-50 cursor-not-allowed"
            >
              Continue with GitHub
            </button>
          </div>

          <p className="text-center text-xs text-[#8CA6C4] mt-5">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" className="text-blue hover:underline" onClick={() => setMode('register')}>
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already a hero?{' '}
                <button type="button" className="text-blue hover:underline" onClick={() => setMode('login')}>
                  Login
                </button>
              </>
            )}
          </p>
        </PixelPanel>
        </motion.div>
      </div>
    </div>
  );
};
