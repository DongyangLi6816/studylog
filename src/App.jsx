import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LeetCodeProvider } from './context/LeetCodeContext';
import { CollegeProvider } from './context/CollegeContext';
import { TimerProvider } from './context/TimerContext';
import { TodosProvider } from './context/TodosContext';
import { CrossLogProvider } from './context/CrossLogContext';
import { CelebrationProvider } from './context/CelebrationContext';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeetCode from './pages/LeetCode';
import College from './pages/College';
import Todos from './pages/Todos';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import FloatingTimer from './components/FloatingTimer';
import CrossLogOverlay from './components/CrossLogOverlay';
import CelebrationManager from './components/celebrations/CelebrationManager';
import { ApiError } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => {
        if (error instanceof ApiError && error.status === 401) return false;
        return count < 2;
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HashRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <LeetCodeProvider>
                      <CollegeProvider>
                        <TimerProvider>
                          <TodosProvider>
                            <CrossLogProvider>
                              <CelebrationProvider>
                                <Layout />
                                <FloatingTimer />
                                <CrossLogOverlay />
                                <CelebrationManager />
                              </CelebrationProvider>
                            </CrossLogProvider>
                          </TodosProvider>
                        </TimerProvider>
                      </CollegeProvider>
                    </LeetCodeProvider>
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="todos" element={<Todos />} />
                <Route path="leetcode" element={<LeetCode />} />
                <Route path="college" element={<College />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </AuthProvider>
        </HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
