import { db } from "../db/index.js";
import { inventoryTable, inventoryLogsTable } from "../models/index.js";

export const createInventoryItem = (data) =>
  db.insert(inventoryTable).values(data).returning();

export const getProjectInventory = (projectId) =>
  db
    .select()
    .from(inventoryTable)
    .where(inventoryTable.projectId.eq(projectId));

export const logInventoryChange = (data, workerId) =>
  db
    .insert(inventoryLogsTable)
    .values({ ...data, workerId })
    .returning();

export const getInventoryLogs = (inventoryId) =>
  db
    .select()
    .from(inventoryLogsTable)
    .where(inventoryLogsTable.inventoryId.eq(inventoryId));
