import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/contact', label: 'Contact' },
];

const guestLinks = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

// NavLink = Link + automatic "active" class, so the current page is highlighted.
function NavBar({ darkMode, onToggleTheme, loggedIn, userEmail, onLogout }) {
  const renderLink = (l) => (
    <NavLink
      key={l.to}
      to={l.to}
      end={l.to === '/'}
      className={({ isActive }) => (isActive ? 'active' : '')}
    >
      {l.label}
    </NavLink>
  );

  return (
    <nav className="navbar">
      {links.map(renderLink)}
      <button type="button" className="theme-toggle" onClick={onToggleTheme}>
        {darkMode ? 'Light mode' : 'Dark mode'}
      </button>
      {loggedIn ? (
        <>
          {userEmail && <span className="nav-user">{userEmail}</span>}
          <button type="button" className="danger" onClick={onLogout}>
            Logout
          </button>
        </>
      ) : (
        guestLinks.map(renderLink)
      )}
    </nav>
  );
}

export default NavBar;
