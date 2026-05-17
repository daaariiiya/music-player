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
            <NavLink to="/statistics" className={navClass}>Statistics</NavLink>
            <NavLink to="/profile" className={navClass}>Profile</NavLink>
          </>
        )}
        {role === 'admin' && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Admin</div>
            <NavLink to="/admin/performers/create" className={navClass}>New performer</NavLink>
            <NavLink to="/admin/albums/create" className={navClass}>New album</NavLink>
            <NavLink to="/admin/songs/create" className={navClass}>New song</NavLink>
            <div className="sidebar-section-title" style={{ marginTop: '0.5rem' }}>Bulk import</div>
            <NavLink to="/admin/performers/bulk" className={navClass}>Bulk performers</NavLink>
            <NavLink to="/admin/albums/bulk" className={navClass}>Bulk albums + songs</NavLink>
            <NavLink to="/admin/songs/bulk" className={navClass}>Bulk songs</NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};
