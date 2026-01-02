import { db } from "../db/index.js";
import { leaveRequestsTable } from "../models/index.js";

export const createLeaveRequest = (data) =>
  db.insert(leaveRequestsTable).values(data).returning();

export const getWorkerLeaves = (workerId) =>
  db
    .select()
    .from(leaveRequestsTable)
    .where(leaveRequestsTable.workerId.eq(workerId));

export const updateLeaveStatus = (id, status, approvedBy) =>
  db
    .update(leaveRequestsTable)
    .set({ status, approvedBy, approvedAt: new Date() })
    .where(leaveRequestsTable.id.eq(id))
    .returning();
