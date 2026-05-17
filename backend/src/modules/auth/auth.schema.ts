import * as yup from 'yup';

export const registerSchema = yup.object({
  username: yup.string().trim().min(2).max(50).required(),
  email: yup.string().trim().lowercase().email().max(100).required(),
  password: yup.string().min(8).max(100).required(),
});
export type RegisterInput = yup.InferType<typeof registerSchema>;

export const loginSchema = yup.object({
  email: yup.string().trim().lowercase().email().max(100).required(),
  password: yup.string().min(1).max(100).required(),
});
export type LoginInput = yup.InferType<typeof loginSchema>;

export const verifyEmailQuerySchema = yup.object({
  token: yup.string().trim().min(10).max(255).required(),
});
export type VerifyEmailQuery = yup.InferType<typeof verifyEmailQuerySchema>;

export const forgotPasswordSchema = yup.object({
  email: yup.string().trim().lowercase().email().max(100).required(),
});
export type ForgotPasswordInput = yup.InferType<typeof forgotPasswordSchema>;

export const resetPasswordSchema = yup.object({
  token: yup.string().trim().min(10).max(255).required(),
  password: yup.string().min(8).max(100).required(),
});
export type ResetPasswordInput = yup.InferType<typeof resetPasswordSchema>;
