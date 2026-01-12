import { Router } from "express";
import { z } from "zod";
import { leaveService } from "../services/leave.service.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

const leaveSchema = z.object({
  workerId: z.string().uuid("Invalid worker ID"),
  type: z.string().min(1, "Leave type required"),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

// GET all leave requests
router.get("/", verifyToken, async (req, res) => {
  try {
    const leaves = await leaveService.getAllLeaveRequests();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = leaveSchema.parse(req.body);
    const leave = await leaveService.createLeaveRequest(validated);
    res.status(201).json(leave);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/worker/:workerId", verifyToken, async (req, res) => {
  try {
    const leaves = await leaveService.getWorkerLeaves(req.params.workerId);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve leave request
router.put("/:id/approve", verifyToken, async (req, res) => {
  try {
    const updated = await leaveService.updateLeaveStatus(req.params.id, "APPROVED", req.user?.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject leave request
router.put("/:id/reject", verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const updated = await leaveService.updateLeaveStatus(req.params.id, "REJECTED", req.user?.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = leaveSchema.partial().parse(req.body);
    const updated = await leaveService.updateLeaveStatus(req.params.id, validated.status, req.user?.id);
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

export default router;
