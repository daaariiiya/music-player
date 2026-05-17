// Pattern: Repository
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { users, type User, type NewUser } from '../../schema/users.js';

/**
 * Finds a user by email.
 * @param email - normalized email
 * @returns user record or null
 */
export const findByEmail = (email: string): Promise<User | null> =>
  db.select().from(users).where(eq(users.email, email)).limit(1).then((r) => r[0] ?? null);

/**
 * Finds a user by primary key.
 * @param userId - user_id
 * @returns user record or null
 */
export const findById = (userId: number): Promise<User | null> =>
  db.select().from(users).where(eq(users.user_id, userId)).limit(1).then((r) => r[0] ?? null);

/**
 * Finds a user by their pending verification token.
 * @param token - verification token
 * @returns user record or null
 */
export const findByVerificationToken = (token: string): Promise<User | null> =>
  db.select().from(users).where(eq(users.verification_token, token)).limit(1).then((r) => r[0] ?? null);

/**
 * Finds a user by their pending password-reset token.
 * @param token - reset token
 * @returns user record or null
 */
export const findByResetToken = (token: string): Promise<User | null> =>
  db.select().from(users).where(eq(users.reset_token, token)).limit(1).then((r) => r[0] ?? null);

/**
 * Inserts a new user.
 * @param data - insert payload (already hashed password, optional verification token)
 * @returns inserted user
 */
export const insertUser = (data: NewUser): Promise<User> =>
  db.insert(users).values(data).returning().then((r) => r[0]);

/**
 * Marks a user as verified and clears the verification token.
 * @param userId - user_id
 */
export const markVerified = (userId: number): Promise<void> =>
  db
    .update(users)
    .set({ verified: true, verification_token: null })
    .where(eq(users.user_id, userId))
    .then(() => undefined);

/**
 * Stores a password-reset token and its expiry on the user.
 * @param userId - user_id
 * @param token - reset token
 * @param expiresAt - expiry timestamp
 */
export const setResetToken = (
  userId: number,
  token: string,
  expiresAt: Date
): Promise<void> =>
  db
    .update(users)
    .set({ reset_token: token, reset_token_expires_at: expiresAt })
    .where(eq(users.user_id, userId))
    .then(() => undefined);

/**
 * Updates a user's password hash and clears the reset token.
 * @param userId - user_id
 * @param passwordHash - new bcrypt hash
 */
export const updatePasswordAndClearResetToken = (
  userId: number,
  passwordHash: string
): Promise<void> =>
  db
    .update(users)
    .set({ password_hash: passwordHash, reset_token: null, reset_token_expires_at: null })
    .where(eq(users.user_id, userId))
    .then(() => undefined);
