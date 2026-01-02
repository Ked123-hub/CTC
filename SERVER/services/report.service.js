import { db } from "../db/index.js";
import { dailyReportsTable, reportItemsTable } from "../models/index.js";

export const createDailyReport = (data, submittedBy) =>
  db
    .insert(dailyReportsTable)
    .values({ ...data, submittedBy })
    .returning();

export const getProjectReports = (projectId) =>
  db
    .select()
    .from(dailyReportsTable)
    .where(dailyReportsTable.projectId.eq(projectId));

export const addReportItem = (data) =>
  db.insert(reportItemsTable).values(data).returning();

export const getReportItems = (reportId) =>
  db
    .select()
    .from(reportItemsTable)
    .where(reportItemsTable.dailyReportId.eq(reportId));
