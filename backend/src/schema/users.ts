import { pgTable, serial, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 10 }).notNull().default('user'),
  verified: boolean('verified').notNull().default(false),
  verification_token: varchar('verification_token', { length: 255 }),
  reset_token: varchar('reset_token', { length: 255 }),
  reset_token_expires_at: timestamp('reset_token_expires_at'),
  created_at: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
