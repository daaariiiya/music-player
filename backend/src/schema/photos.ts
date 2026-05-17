import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const photos = pgTable('photos', {
  photo_id: serial('photo_id').primaryKey(),
  url: varchar('url', { length: 500 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
