import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { leaveRequestsTable } from "../models/index.js";
import { verifyToken } from "../auth/middleware.js";
import { eq } from "drizzle-orm";

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
    const leaves = await db.select().from(leaveRequestsTable);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = leaveSchema.parse(req.body);
    const [leave] = await db
      .insert(leaveRequestsTable)
      .values(validated)
      .returning();
    res.status(201).json(leave);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/worker/:workerId", verifyToken, async (req, res) => {
  try {
    const leaves = await db
      .select()
      .from(leaveRequestsTable)
      .where(eq(leaveRequestsTable.workerId, req.params.workerId));
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve leave request
router.put("/:id/approve", verifyToken, async (req, res) => {
  try {
    const [updated] = await db
      .update(leaveRequestsTable)
      .set({ status: "APPROVED", approvedAt: new Date() })
      .where(eq(leaveRequestsTable.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject leave request
router.put("/:id/reject", verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const [updated] = await db
      .update(leaveRequestsTable)
      .set({ status: "REJECTED", rejectionReason: reason })
      .where(eq(leaveRequestsTable.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = leaveSchema.partial().parse(req.body);
    const [updated] = await db
      .update(leaveRequestsTable)
      .set({ ...validated, approvedAt: new Date() })
      .where(eq(leaveRequestsTable.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

export default router;
