import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

/**
 * Sidebar - Main navigation sidebar for the dashboard
 */
export function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/portfolios', label: 'Portfolios' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/reports', label: 'Reports' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-mark">H</span>
          <span className="logo-text">HelixGuard</span>
        </div>
        <span className="logo-tagline">Clinical AI Governance</span>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link--active' : ''}`
                }
                end={item.path === '/'}
              >
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.fullName || 'User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign out">
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
