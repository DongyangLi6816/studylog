import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LeetCodeProvider } from './context/LeetCodeContext';
import { CollegeProvider } from './context/CollegeContext';
import { TimerProvider } from './context/TimerContext';
import { TodosProvider } from './context/TodosContext';
import { CrossLogProvider } from './context/CrossLogContext';
import { CelebrationProvider } from './context/CelebrationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeetCode from './pages/LeetCode';
import College from './pages/College';
import Todos from './pages/Todos';
import Settings from './pages/Settings';
import FloatingTimer from './components/FloatingTimer';
import CrossLogOverlay from './components/CrossLogOverlay';
import CelebrationManager from './components/celebrations/CelebrationManager';

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <LeetCodeProvider>
          <CollegeProvider>
            <TimerProvider>
              <TodosProvider>
                <CrossLogProvider>
                  <CelebrationProvider>
                    <Routes>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="todos" element={<Todos />} />
                        <Route path="leetcode" element={<LeetCode />} />
                        <Route path="college" element={<College />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
                    </Routes>
                    <FloatingTimer />
                    <CrossLogOverlay />
                    <CelebrationManager />
                  </CelebrationProvider>
                </CrossLogProvider>
              </TodosProvider>
            </TimerProvider>
          </CollegeProvider>
        </LeetCodeProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
