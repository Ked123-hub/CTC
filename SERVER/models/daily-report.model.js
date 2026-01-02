import {
  pgTable,
  uuid,
  date,
  text,
  varchar,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./project.model.js";
import { workersTable } from "./worker.model.js";

export const dailyReportsTable = pgTable("daily_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projectsTable.id),
  date: date("date").notNull(),
  submittedBy: uuid("submitted_by").references(() => workersTable.id),
  summary: text("summary"),
  issues: text("issues"),
  risks: text("risks"),
  needs: text("needs"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reportItemsTable = pgTable("report_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  dailyReportId: uuid("daily_report_id")
    .notNull()
    .references(() => dailyReportsTable.id),
  category: varchar("category", { length: 100 }),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricValue: numeric("metric_value"),
  unit: varchar("unit", { length: 30 }),
  notes: text("notes"),
});
