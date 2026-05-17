import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authApi } from '../../api/auth.api';
import { toast, toastError } from '../../utils/toast';

const schema = yup.object({
  email: yup.string().trim().email().label('Email').required(),
});
type FormValues = yup.InferType<typeof schema>;

export const ForgotPasswordPage = () => {
  const form = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authApi.forgotPassword(values);
      toast.success('If that email exists, a reset link was sent.');
    } catch (e) {
      toastError(e);
    }
  });

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input placeholder="Email" {...form.register('email')} />
        <span style={{ color: 'red' }}>{form.formState.errors.email?.message}</span>
        <button type="submit" disabled={form.formState.isSubmitting}>Send reset link</button>
      </form>
    </div>
  );
};
