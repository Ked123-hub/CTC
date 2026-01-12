import { DailyReport } from "../models/index.js";

export const createDailyReport = async (data, submittedBy) => {
  const dailyReport = new DailyReport({ ...data, submittedBy });
  await dailyReport.save();
  return dailyReport;
};

export const getProjectReports = async (projectId) => {
  const reports = await DailyReport.find({ projectId }).sort({ createdAt: -1 });
  return reports;
};

export const addReportItem = async (data) => {
  const report = await DailyReport.findById(data.dailyReportId);
  if (!report) {
    throw new Error("Daily report not found");
  }

  // Add item to report metrics
  report.metrics.push({
    ...data,
    recordedAt: new Date(),
  });

  await report.save();
  return report.metrics[report.metrics.length - 1];
};

export const getReportItems = async (reportId) => {
  const report = await DailyReport.findById(reportId).select('metrics');
  if (!report) {
    throw new Error("Daily report not found");
  }

  return report.metrics;
};
