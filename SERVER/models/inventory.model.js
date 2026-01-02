import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./project.model.js";
import { workersTable } from "./worker.model.js";

export const inventoryTable = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projectsTable.id),
  itemName: varchar("item_name", { length: 150 }).notNull(),
  category: varchar("category", { length: 100 }),
  quantityAvailable: integer("quantity_available").notNull().default(0),
  unit: varchar("unit", { length: 30 }),
  location: varchar("location", { length: 150 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventoryLogsTable = pgTable("inventory_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  inventoryId: uuid("inventory_id")
    .notNull()
    .references(() => inventoryTable.id),
  workerId: uuid("worker_id").references(() => workersTable.id),
  changeQty: integer("change_qty").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
