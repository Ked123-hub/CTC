import { db } from "../db/index.js";
import { projectsTable } from "../models/index.js";
import { eq } from "drizzle-orm";

export const createProject = (data) =>
  db.insert(projectsTable).values(data).returning();

export const getAllProjects = () => db.select().from(projectsTable);

export const getProjectById = (id) =>
  db.select().from(projectsTable).where(eq(projectsTable.id, id));

export const updateProject = (id, data) =>
  db
    .update(projectsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projectsTable.id, id))
    .returning();

export const deleteProject = (id) =>
  db.delete(projectsTable).where(eq(projectsTable.id, id));
