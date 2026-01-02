import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { workersTable } from "./worker.model.js";

export const leaveRequestsTable = pgTable("leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workersTable.id),
  type: varchar("type", { length: 50 }).notNull(), // e.g., SICK, VACATION
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 30 }).notNull().default("PENDING"),
  approvedBy: uuid("approved_by").references(() => workersTable.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
