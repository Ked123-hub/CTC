import { db } from "../db/index.js";
import { eventsTable } from "../models/index.js";

export const createEvent = (data) =>
  db.insert(eventsTable).values(data).returning();

export const getProjectEvents = (projectId) =>
  db.select().from(eventsTable).where(eventsTable.projectId.eq(projectId));

export const updateEvent = (id, data) =>
  db.update(eventsTable).set(data).where(eventsTable.id.eq(id)).returning();

export const deleteEvent = (id) =>
  db.delete(eventsTable).where(eventsTable.id.eq(id));
