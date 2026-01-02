import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
  text,
  doublePrecision,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { workersTable } from "./worker.model.js";

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  location: varchar("location", { length: 255 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  description: text("description"),

  // Project Leader / Manager Assignment
  projectLeaderId: uuid("project_leader_id").references(() => workersTable.id),
  requiredSkills: jsonb("required_skills").default("[]"),
  // ["Sorting", "Collection", "Recycling"]

  // Geofence Configuration
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  geofenceRadiusKm: doublePrecision("geofence_radius_km").default(0.5),
  geofenceEnabled: boolean("geofence_enabled").default(true),
  geofenceZones: jsonb("geofence_zones").$type(),
  enforceGeofenceOnCheckIn: boolean("enforce_geofence_on_checkin").default(
    true
  ),
  alertOnGeofenceBreach: boolean("alert_on_geofence_breach").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
