import { db } from "../db/index.js";
import { shiftsTable } from "../models/index.js";

export const createShift = (data) =>
  db.insert(shiftsTable).values(data).returning();

export const getShiftsByProject = (projectId) =>
  db.select().from(shiftsTable).where(shiftsTable.projectId.eq(projectId));

export const getShiftById = (id) =>
  db.select().from(shiftsTable).where(shiftsTable.id.eq(id));

export const updateShift = (id, data) =>
  db.update(shiftsTable).set(data).where(shiftsTable.id.eq(id)).returning();

export const deleteShift = (id) =>
  db.delete(shiftsTable).where(shiftsTable.id.eq(id));
