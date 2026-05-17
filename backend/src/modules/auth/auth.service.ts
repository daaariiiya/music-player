import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors.js';
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '../../services/email.service.js';
import * as authRepo from './auth.repository.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema.js';
import type { AccessTokenPayload } from '../../middleware/auth.middleware.js';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL: SignOptions['expiresIn'] = '15m';
const REFRESH_TOKEN_TTL: SignOptions['expiresIn'] = '7d';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface RefreshTokenPayload {
  userId: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  userId: number;
  username: string;
  email: string;
  role: string;
  verified: boolean;
}

const toPublicUser = (u: {
  user_id: number;
  username: string;
  email: string;
  role: string;
  verified: boolean;
}): PublicUser => ({
  userId: u.user_id,
  username: u.username,
  email: u.email,
  role: u.role,
  verified: u.verified,
});

const generateUrlSafeToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('base64url');

const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

/**
 * Registers a new user, sends a verification email.
 * @param input - validated register payload
 * @returns inserted user (public shape)
 * @throws ConflictError if email already taken
 */
export const register = async (input: RegisterInput): Promise<PublicUser> => {
  const existing = await authRepo.findByEmail(input.email);
  if (existing) throw new ConflictError('Email already registered.');

  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const verification_token = generateUrlSafeToken();

  const created = await authRepo.insertUser({
    username: input.username,
    email: input.email,
    password_hash,
    role: 'user',
    verified: false,
    verification_token,
  });

  await sendVerificationEmail(created.email, created.username, verification_token);

  return toPublicUser(created);
};

/**
 * Verifies an email-verification token and marks the user verified.
 * @param token - verification token from email link
 * @throws BadRequestError if token does not match any pending user
 */
export const verifyEmail = async (token: string): Promise<void> => {
  const user = await authRepo.findByVerificationToken(token);
  if (!user) throw new BadRequestError('Invalid or expired verification token.');
  await authRepo.markVerified(user.user_id);
};

/**
 * Authenticates a user and issues access + refresh tokens.
 * @param input - validated login payload
 * @throws UnauthorizedError on invalid credentials or unverified email
 */
export const login = async (
  input: LoginInput
): Promise<{ tokens: AuthTokens; user: PublicUser }> => {
  const user = await authRepo.findByEmail(input.email);
  if (!user) throw new UnauthorizedError('Invalid credentials.');

  const ok = await bcrypt.compare(input.password, user.password_hash);
  if (!ok) throw new UnauthorizedError('Invalid credentials.');

  if (!user.verified) throw new UnauthorizedError('Email not verified.');

  const role = (user.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin';
  const accessToken = signAccessToken({ userId: user.user_id, role });
  const refreshToken = signRefreshToken({ userId: user.user_id });

  return { tokens: { accessToken, refreshToken }, user: toPublicUser(user) };
};

/**
 * Rotates an access token from a valid refresh token.
 * @param refreshToken - refresh JWT from httpOnly cookie
 * @returns new access token
 * @throws UnauthorizedError if refresh invalid or user missing
 */
export const refresh = async (refreshToken: string): Promise<{ accessToken: string }> => {
  let payload: RefreshTokenPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token.');
  }

  const user = await authRepo.findById(payload.userId);
  if (!user) throw new UnauthorizedError('User no longer exists.');

  const role = (user.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin';
  const accessToken = signAccessToken({ userId: user.user_id, role });
  return { accessToken };
};

/**
 * Returns the authenticated user's public profile.
 * @param userId - id from access-token claims
 * @throws NotFoundError if user no longer exists
 */
export const getCurrentUser = async (userId: number): Promise<PublicUser> => {
  const user = await authRepo.findById(userId);
  if (!user) throw new NotFoundError('User not found.');
  return toPublicUser(user);
};

/**
 * Initiates a password reset by storing a token + emailing it.
 * Silently no-ops when the email is unknown to avoid account enumeration.
 * @param input - validated forgot-password payload
 */
export const forgotPassword = async (input: ForgotPasswordInput): Promise<void> => {
  const user = await authRepo.findByEmail(input.email);
  if (!user) return;

  const token = generateUrlSafeToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await authRepo.setResetToken(user.user_id, token, expiresAt);
  await sendResetPasswordEmail(user.email, user.username, token);
};

/**
 * Validates a reset token and replaces the user's password hash.
 * @param input - validated reset-password payload
 * @throws BadRequestError if token invalid or expired
 */
export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
  const user = await authRepo.findByResetToken(input.token);
  if (!user || !user.reset_token_expires_at) {
    throw new BadRequestError('Invalid or expired reset token.');
  }
  if (user.reset_token_expires_at.getTime() < Date.now()) {
    throw new BadRequestError('Invalid or expired reset token.');
  }

  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await authRepo.updatePasswordAndClearResetToken(user.user_id, password_hash);
};
