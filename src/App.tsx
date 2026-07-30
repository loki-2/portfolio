import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project/:pageId" element={<ProjectPage />} />
    </Routes>
  );
}

export default App;
