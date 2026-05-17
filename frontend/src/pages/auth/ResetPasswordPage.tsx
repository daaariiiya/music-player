import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { toast, toastError } from '../../utils/toast';

const schema = yup.object({
  password: yup.string().min(8).label('Password').required(),
});
type FormValues = yup.InferType<typeof schema>;

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const form = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) {
      toast.error('Missing token.');
      return;
    }
    try {
      await authApi.resetPassword({ token, password: values.password });
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (e) {
      toastError(e);
    }
  });

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Reset Password</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input type="password" placeholder="New password" {...form.register('password')} />
        <span style={{ color: 'red' }}>{form.formState.errors.password?.message}</span>
        <button type="submit" disabled={form.formState.isSubmitting}>Reset</button>
      </form>
    </div>
  );
};
