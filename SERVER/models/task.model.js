import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./project.model.js";
import { workersTable } from "./worker.model.js";

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projectsTable.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 30 }).default("MEDIUM"),
  plannedStart: timestamp("planned_start", { withTimezone: true }),
  plannedEnd: timestamp("planned_end", { withTimezone: true }),
  status: varchar("status", { length: 30 }).default("BACKLOG"),
  requiredSkills: jsonb("required_skills").default("[]"),
  // ["Sorting", "Collection"]
  createdBy: uuid("created_by").references(() => workersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const taskAssignmentsTable = pgTable("task_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasksTable.id),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workersTable.id),
  roleOnTask: varchar("role_on_task", { length: 50 }),
  allocationPercent: integer("allocation_percent"),
  assignedAt: timestamp("assigned_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const taskUpdatesTable = pgTable("task_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasksTable.id),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workersTable.id),
  note: text("note"),
  progressPercent: integer("progress_percent"),
  attachmentUrl: varchar("attachment_url", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
