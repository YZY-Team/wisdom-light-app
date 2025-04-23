import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  list_id: integer('list_id')
    .notNull()
    .references(() => lists.id),
});

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  time: text('time').notNull(),
  isUser: integer('isUser').notNull(),
});

// Export Task to use as an interface in your app
export type Task = typeof tasks.$inferSelect;
export type Message = typeof messages.$inferSelect; 