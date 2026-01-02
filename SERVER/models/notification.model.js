import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { workersTable } from "./worker.model.js";

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workersTable.id),
  type: varchar("type", { length: 100 }).notNull(),
  payload: jsonb("payload").default("{}"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});
