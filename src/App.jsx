import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Data lives here and is passed down as props (Practical 1).
const name = 'Vaishnavi';
const themeColor = '#4f46e5';
const email = '24dcs090@charusat.edu.in'; 
const bio =
  'I am a college student who enjoys building full-stack projects, from healthcare platforms to security dashboards.';
const skillList = ['HTML', 'CSS', 'JavaScript', 'React', 'React Router', 'Node.js', 'Express', 'MongoDB', 'Git'];

function App() {
  // useState #1 (Practical 2 supplementary): dark / light mode
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      <Header name={name} themeColor={themeColor} />
      <NavBar darkMode={darkMode} onToggleTheme={() => setDarkMode((d) => !d)} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home bio={bio} skillList={skillList} />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer name={name} email={email} />
    </div>
  );
}

export default App;
