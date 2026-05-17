import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { toast, toastError } from '../../utils/toast';

const schema = yup.object({
  email: yup.string().trim().email().label('Email').required(),
  password: yup.string().min(1).label('Password').required(),
});

type FormValues = yup.InferType<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await authApi.login(values);
      if (!res.data) throw new Error(res.message);
      const { accessToken, user } = res.data;
      setAuth({ userId: user.userId, role: user.role, accessToken });
      toast.success('Welcome back.');
      navigate('/');
    } catch (e) {
      toastError(e);
    }
  });

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input placeholder="Email" {...form.register('email')} />
        {form.formState.errors.email && <span style={{ color: 'red' }}>{form.formState.errors.email.message}</span>}
        <input type="password" placeholder="Password" {...form.register('password')} />
        {form.formState.errors.password && <span style={{ color: 'red' }}>{form.formState.errors.password.message}</span>}
        <button type="submit" disabled={form.formState.isSubmitting}>Login</button>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
      <p><Link to="/forgot-password">Forgot password?</Link></p>
    </div>
  );
};
