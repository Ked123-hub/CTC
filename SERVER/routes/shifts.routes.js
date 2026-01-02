import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { shiftsTable } from "../models/index.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

const shiftSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  name: z.string().min(1, "Shift name required"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  recurrenceRule: z.string().optional(),
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = shiftSchema.parse(req.body);
    const [shift] = await db.insert(shiftsTable).values(validated).returning();
    res.status(201).json(shift);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const shifts = await db
      .select()
      .from(shiftsTable)
      .where(shiftsTable.projectId.eq(req.params.projectId));
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [shift] = await db
      .select()
      .from(shiftsTable)
      .where(shiftsTable.id.eq(req.params.id));
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = shiftSchema.partial().parse(req.body);
    const [updated] = await db
      .update(shiftsTable)
      .set(validated)
      .where(shiftsTable.id.eq(req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await db.delete(shiftsTable).where(shiftsTable.id.eq(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
