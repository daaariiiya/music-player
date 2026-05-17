import type { Context } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { success } from '../../utils/response.js';
import * as authService from './auth.service.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailQuery,
} from './auth.schema.js';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7d in seconds

const setRefreshCookie = (c: Context, token: string): void => {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

export const register = async (c: Context) => {
  const input = c.get('body') as RegisterInput;
  const user = await authService.register(input);
  return c.json(success('Registration successful. Check your email to verify.', { user }), 201);
};

export const verifyEmail = async (c: Context) => {
  const query = c.get('query') as VerifyEmailQuery;
  await authService.verifyEmail(query.token);
  return c.json(success('Email verified.'));
};

export const login = async (c: Context) => {
  const input = c.get('body') as LoginInput;
  const { tokens, user } = await authService.login(input);
  setRefreshCookie(c, tokens.refreshToken);
  return c.json(success('Login successful.', { accessToken: tokens.accessToken, user }));
};

export const refresh = async (c: Context) => {
  const token = getCookie(c, REFRESH_COOKIE);
  if (!token) throw new UnauthorizedError('Missing refresh token.');
  const { accessToken } = await authService.refresh(token);
  return c.json(success('Token refreshed.', { accessToken }));
};

export const logout = async (c: Context) => {
  deleteCookie(c, REFRESH_COOKIE, {
    path: '/',
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  return c.json(success('Logout successful.'));
};

export const me = async (c: Context) => {
  const userId = c.get('userId') as number;
  const user = await authService.getCurrentUser(userId);
  return c.json(success('Current user.', { user }));
};

export const forgotPassword = async (c: Context) => {
  const input = c.get('body') as ForgotPasswordInput;
  await authService.forgotPassword(input);
  return c.json(success('If that email exists, a reset link was sent.'));
};

export const resetPassword = async (c: Context) => {
  const input = c.get('body') as ResetPasswordInput;
  await authService.resetPassword(input);
  return c.json(success('Password reset.'));
};
