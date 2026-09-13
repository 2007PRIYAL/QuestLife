import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, LogIn } from 'lucide-react';
import heroScene from '@/assets/images/hero-scene.jpg';
import { PixelButton } from '@/components/PixelButton';
import { useAuth } from '@/context/AuthContext';

// Deterministic little starfield of floating particles drifting upward —
// purely decorative (aria-hidden), respects prefers-reduced-motion via the
// app-wide <MotionConfig reducedMotion="user"> in App.tsx.
const PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: (i * 53.7) % 100,
  size: 2 + (i % 3),
  duration: 6 + (i % 5),
  delay: (i % 6) * 0.6,
}));

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const particles = useMemo(() => PARTICLES, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="app-shell relative overflow-hidden">
      <img
        src={heroScene}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[#050b14]/20 to-[#050b14]/40" />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-[#FFF6D8]"
            style={{ left: `${p.left}%`, width: p.size, height: p.size, bottom: '-10%' }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.9, 0], y: '-120vh' }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="relative flex-1 flex flex-col justify-between px-6 pt-14 pb-8 min-h-[100dvh]">
        <motion.div
          className="flex flex-col items-center text-center gap-3"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="flex items-center gap-2 bg-[#1a2d1f]/80 border-2 border-black rounded-pixel px-3 py-1.5 text-[10px] font-pixel text-green rotate-[-3deg]"
            aria-hidden="true"
          >
            Small steps. Big adventures.
          </div>

          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Swords size={34} className="text-blue" aria-hidden="true" />
            <h1 className="font-pixel text-3xl text-gold text-shadow-pixel leading-tight">
              QuestLife
            </h1>
          </motion.div>
          <p className="font-pixel text-[9px] text-blue text-shadow-pixel">
            Level up your real life
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <PixelButton
            variant="gold"
            onClick={() => navigate('/login')}
            className="text-[13px] py-4"
          >
            Get Started →
          </PixelButton>
          <PixelButton
            variant="outline"
            icon={<LogIn size={16} aria-hidden="true" />}
            onClick={() => navigate('/login')}
            className="text-[11px]"
          >
            Login →
          </PixelButton>
          <p className="text-center font-pixel text-[8px] text-[#8CA6C4] mt-1">
            A more epic you awaits
          </p>
        </motion.div>
      </div>
    </div>
  );
};
