import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeetCode from './pages/LeetCode';
import College from './pages/College';
import Settings from './pages/Settings';
import FloatingTimer from './components/FloatingTimer';

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leetcode" element={<LeetCode />} />
            <Route path="college" element={<College />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <FloatingTimer />
      </HashRouter>
    </ThemeProvider>
  );
}
