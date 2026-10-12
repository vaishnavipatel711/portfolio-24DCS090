import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { getToken, saveToken, clearToken, setUnauthorizedHandler, getMe } from './api';

// Practical 8: route-based code splitting. Home stays in the main bundle because
// it is the landing page; every other page is downloaded only when first visited.
const Projects = lazy(() => import('./pages/Projects'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Data lives here and is passed down as props (Practical 1).
const name = 'Vaishnavi';
const themeColor = '#4f46e5';
const email = 'you@example.com'; // TODO: put your real email
const bio =
  'I am a college student who enjoys building full-stack projects, from healthcare platforms to security dashboards.';
const skillList = ['HTML', 'CSS', 'JavaScript', 'React', 'React Router', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Git'];

function App() {
  // Practical 2 supplementary: dark / light mode
  const [darkMode, setDarkMode] = useState(false);

  // Practical 7: authentication state
  const [token, setToken] = useState(getToken); // restored from localStorage on refresh
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Logout: clear the token everywhere, then go to the login page with a message
  const logout = useCallback(
    (message) => {
      clearToken();
      setToken(null);
      setUser(null);
      navigate('/login', { state: message ? { message } : null });
    },
    [navigate],
  );

  // If any protected request returns 401, api.js calls this (session expired)
  useEffect(() => {
    setUnauthorizedHandler(() => logout('Your session expired. Please log in again.'));
  }, [logout]);

  // On page load, if a token is saved, fetch the user's details from /auth/me.
  // An expired token gets a 401 here, which triggers the handler above.
  useEffect(() => {
    if (!getToken()) return;
    getMe()
      .then(setUser)
      .catch(() => {});
  }, []);

  function handleLoggedIn(data) {
    saveToken(data.token);
    setToken(data.token);
    setUser(data.user);
    navigate('/tasks');
  }

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      <Header name={name} themeColor={themeColor} />
      <NavBar
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((d) => !d)}
        loggedIn={Boolean(token)}
        userEmail={user?.email}
        onLogout={() => logout('You have been logged out.')}
      />
      <main className="main">
        {/* Suspense wraps only the Routes block, so the header, navbar and footer stay visible */}
        <Suspense fallback={<Spinner label="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Home bio={bio} skillList={skillList} />} />
            <Route path="/projects" element={<Projects />} />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute token={token}>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login onLoggedIn={handleLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer name={name} email={email} />
    </div>
  );
}

export default App;