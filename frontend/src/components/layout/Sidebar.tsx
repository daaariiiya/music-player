import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active-link' : undefined);

export const Sidebar = () => {
  const { isAuthenticated, role } = useAuthStore();
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);

  if (!isSidebarOpen) return null;

  return (
    <aside className="app-sidebar">
      <nav>
        <NavLink to="/" className={navClass} end>Home</NavLink>
        <NavLink to="/performers" className={navClass}>Performers</NavLink>
        <NavLink to="/albums" className={navClass}>Albums</NavLink>
        <NavLink to="/songs" className={navClass}>Songs</NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/playlists" className={navClass}>Playlists</NavLink>
            <NavLink to="/profile" className={navClass}>Profile</NavLink>
          </>
        )}
        {role === 'admin' && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Admin</div>
            <NavLink to="/statistics" className={navClass}>Statistics</NavLink>
            <NavLink to="/admin/performers/new" className={navClass}>New performers</NavLink>
            <NavLink to="/admin/albums/new" className={navClass}>New albums + songs</NavLink>
            <NavLink to="/admin/songs/new" className={navClass}>New songs</NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};
