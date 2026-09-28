import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/contact', label: 'Contact' },
];

// NavLink = Link + automatic "active" class, so the current page is highlighted.
function NavBar({ darkMode, onToggleTheme }) {
  return (
    <nav className="navbar">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {l.label}
        </NavLink>
      ))}
      <button type="button" className="theme-toggle" onClick={onToggleTheme}>
        {darkMode ? 'Light mode' : 'Dark mode'}
      </button>
    </nav>
  );
}

export default NavBar;
