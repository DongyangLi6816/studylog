import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TimerProvider } from './context/TimerContext';
import { TodosProvider } from './context/TodosContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeetCode from './pages/LeetCode';
import College from './pages/College';
import Todos from './pages/Todos';
import Settings from './pages/Settings';
import FloatingTimer from './components/FloatingTimer';

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <TimerProvider>
          <TodosProvider>
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
          </TodosProvider>
        </TimerProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
