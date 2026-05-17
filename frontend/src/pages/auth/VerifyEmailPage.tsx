import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying...');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setStatus('error');
      setMessage('Missing token.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then((r) => {
        setStatus('ok');
        setMessage(r.message);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed.');
      });
  }, [token]);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Verify Email</h2>
      <p>{message}</p>
      {status === 'ok' && <Link to="/login">Go to login</Link>}
    </div>
  );
};
