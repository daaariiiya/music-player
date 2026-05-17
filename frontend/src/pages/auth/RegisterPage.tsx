import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { toast, toastError } from '../../utils/toast';

const schema = yup.object({
  username: yup.string().trim().min(2).max(50).label('Username').required(),
  email: yup.string().trim().email().label('Email').required(),
  password: yup.string().min(8).label('Password').required(),
});

type FormValues = yup.InferType<typeof schema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const form = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authApi.register(values);
      toast.success('Registered. Check your email to verify.');
      navigate('/login');
    } catch (e) {
      toastError(e);
    }
  });

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input placeholder="Username" {...form.register('username')} />
        <span style={{ color: 'red' }}>{form.formState.errors.username?.message}</span>
        <input placeholder="Email" {...form.register('email')} />
        <span style={{ color: 'red' }}>{form.formState.errors.email?.message}</span>
        <input type="password" placeholder="Password" {...form.register('password')} />
        <span style={{ color: 'red' }}>{form.formState.errors.password?.message}</span>
        <button type="submit" disabled={form.formState.isSubmitting}>Register</button>
      </form>
      <p>Already have account? <Link to="/login">Login</Link></p>
    </div>
  );
};
