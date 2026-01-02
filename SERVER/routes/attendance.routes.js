import { Router } from "express";
import { verifyToken } from "../auth/middleware.js";
import {
  checkin,
  checkout,
  getByWorker,
  getByProject,
} from "../controllers/attendance.controller.js";

const router = Router();

router.post("/checkin", verifyToken, checkin);
router.patch("/:id/checkout", verifyToken, checkout);
router.get("/worker/:workerId", verifyToken, getByWorker);
router.get("/project/:projectId", verifyToken, getByProject);

export default router;
