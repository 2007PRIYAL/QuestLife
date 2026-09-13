import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { CharacterSelect } from '@/pages/CharacterSelect';
import { Dashboard } from '@/pages/Dashboard';
import { WorldMap } from '@/pages/WorldMap';
import { Quests } from '@/pages/Quests';
import { Focus } from '@/pages/Focus';
import { Stats } from '@/pages/Stats';
import { Analytics } from '@/pages/Analytics';
import { Journal } from '@/pages/Journal';
import { Achievements } from '@/pages/Achievements';
import { Leaderboard } from '@/pages/Leaderboard';
import { Shop } from '@/pages/Shop';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/character-select"
              element={
                <ProtectedRoute>
                  <CharacterSelect />
                </ProtectedRoute>
              }
            />

            {/* Feature 1: Hero Dashboard (Post-Login Home) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <WorldMap />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quests"
              element={
                <ProtectedRoute>
                  <Quests />
                </ProtectedRoute>
              }
            />

            {/* Feature 3: Pomodoro Focus Quest */}
            <Route
              path="/focus"
              element={
                <ProtectedRoute>
                  <Focus />
                </ProtectedRoute>
              }
            />

            {/* Profile / Character Sheet */}
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />

            {/* Feature 6: Weekly Analytics */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* Feature 7: Mood & Journal */}
            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />

            {/* Feature 8: Achievements */}
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
