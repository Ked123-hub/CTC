import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";
import { workersTable } from "./worker.model.js";
import { projectsTable } from "./project.model.js";
import { shiftsTable } from "./shift.model.js";

export const attendanceTable = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workersTable.id),
  projectId: uuid("project_id").references(() => projectsTable.id),
  shiftId: uuid("shift_id").references(() => shiftsTable.id),
  checkInAt: timestamp("check_in_at", { withTimezone: true }),
  checkOutAt: timestamp("check_out_at", { withTimezone: true }),
  checkInLat: numeric("check_in_lat", { precision: 9, scale: 6 }),
  checkInLng: numeric("check_in_lng", { precision: 9, scale: 6 }),
  checkOutLat: numeric("check_out_lat", { precision: 9, scale: 6 }),
  checkOutLng: numeric("check_out_lng", { precision: 9, scale: 6 }),
  method: varchar("method", { length: 50 }),
  status: varchar("status", { length: 30 }).default("PENDING"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
