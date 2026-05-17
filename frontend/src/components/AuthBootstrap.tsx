import { useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { Spinner } from './ui/Spinner';

interface Props {
  children: React.ReactNode;
}

/**
 * Runs on app boot.
 * Tries to exchange the refreshToken cookie for a fresh accessToken,
 * then fetches /auth/me to restore identity + role.
 * Gates render until done so PrivateRoute doesn't redirect prematurely.
 */
export const AuthBootstrap = ({ children }: Props) => {
  const [ready, setReady] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const refreshRes = await authApi.refresh();
        const accessToken = refreshRes.data?.accessToken;
        if (!accessToken) throw new Error('No token returned');

        // setAccessToken first so /auth/me request carries it
        useAuthStore.getState().setAccessToken(accessToken);

        const meRes = await authApi.me();
        const user = meRes.data?.user;
        if (!user) throw new Error('No user returned');

        if (!cancelled) {
          setAuth({ userId: user.userId, role: user.role, accessToken });
        }
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [setAuth, clearAuth]);

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner label="Restoring session..." />
      </div>
    );
  }

  return <>{children}</>;
};
