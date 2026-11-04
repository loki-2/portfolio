import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';
import { Starfield } from './components/Starfield';
import { CustomCursor } from './components/CustomCursor';

function App() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-black text-foreground overflow-x-hidden">
      {/* Global Custom Spaceship Cursor */}
      <CustomCursor />

      {/* Global Starfield background covering the whole site */}
      <Starfield className="fixed inset-0 pointer-events-none z-0" starCount={180} />
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:pageId" element={<ProjectPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
