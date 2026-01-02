import { z } from "zod";

export const reportSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  date: z.string().date(),
  summary: z.string().optional(),
  issues: z.string().optional(),
  risks: z.string().optional(),
  needs: z.string().optional(),
});

export const itemSchema = z.object({
  dailyReportId: z.string().uuid("Invalid report ID"),
  category: z.string().optional(),
  metricName: z.string().min(1, "Metric name required"),
  metricValue: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});
