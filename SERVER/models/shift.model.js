import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { projectsTable } from "./project.model.js";
import { relations } from "drizzle-orm";

export const shiftsTable = pgTable("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  name: varchar("name", { length: 100 }).notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  recurrenceRule: text("recurrence_rule"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shiftsRelations = relations(shiftsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [shiftsTable.projectId],
    references: [projectsTable.id],
  }),
}));
