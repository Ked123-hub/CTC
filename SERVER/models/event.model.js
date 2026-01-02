import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./project.model.js";

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projectsTable.id),
  title: varchar("title", { length: 200 }).notNull(),
  type: varchar("type", { length: 100 }),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }),
  locationLat: numeric("location_lat", { precision: 9, scale: 6 }),
  locationLng: numeric("location_lng", { precision: 9, scale: 6 }),
  status: varchar("status", { length: 30 }).default("PLANNED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
