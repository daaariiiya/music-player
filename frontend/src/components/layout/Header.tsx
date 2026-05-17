import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { authApi } from '../../api/auth.api';

export const Header = () => {
  const { isAuthenticated, role } = useAuthStore();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <header className="app-header">
      <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>
      <h1>Music Player</h1>
      {isAuthenticated ? (
        <>
          {role === 'admin' && <span className="role-badge">admin</span>}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={() => navigate('/login')}>Login</button>
      )}
    </header>
  );
};
