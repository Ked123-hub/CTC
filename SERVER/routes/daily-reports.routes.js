import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import {
  createDailyReport,
  getProjectReports,
  addReportItem,
} from "../services/report.service.js";
import { reportSchema, itemSchema } from "../validators/index.js";

const router = Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = reportSchema.parse(req.body);
    const [report] = await createDailyReport(validated, req.worker.sub);
    res.status(201).json(report);
  } catch (err) {
    throw err;
  }
});

router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const reports = await getProjectReports(req.params.projectId);
    res.json(reports);
  } catch (err) {
    throw err;
  }
});

router.post("/items", verifyToken, async (req, res) => {
  try {
    const validated = itemSchema.parse(req.body);
    const [item] = await addReportItem(validated);
    res.status(201).json(item);
  } catch (err) {
    throw err;
  }
});

export default router;
