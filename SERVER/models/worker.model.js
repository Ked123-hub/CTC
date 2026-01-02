import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", [
  "ADMIN",
  "MANAGER",
  "WORKER",
  "VOLUNTEER",
  "VERIFICATION_OFFICER",
]);

export const workersTable = pgTable("workers", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstname: varchar("firstname", { length: 55 }).notNull(),
  lastname: varchar("lastname", { length: 55 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),

  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),

  role: rolesEnum("role").notNull().default("WORKER"),

  department: varchar("department", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  profilePictureUrl: varchar("profile_picture_url", { length: 255 }),

  skills: jsonb("skills").default("{}"),
  // ["Sorting", "Collection", "Awareness"]

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});
