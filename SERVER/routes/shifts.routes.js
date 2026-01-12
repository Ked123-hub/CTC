import { Router } from "express";
import { z } from "zod";
import { shiftService } from "../services/shift.service.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

const shiftSchema = z.object({
  projectId: z.string().min(1, "Invalid project ID"),
  name: z.string().min(1, "Shift name required"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  recurrenceRule: z.string().optional(),
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = shiftSchema.parse(req.body);
    const shift = await shiftService.createShift(validated);
    res.status(201).json(shift);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const shifts = await shiftService.getShiftsByProject(req.params.projectId);
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const shifts = await shiftService.getShiftById(req.params.id);
    if (shifts.length === 0) return res.status(404).json({ error: "Shift not found" });
    res.json(shifts[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = shiftSchema.partial().parse(req.body);
    const shift = await shiftService.updateShift(req.params.id, validated);
    res.json(shift);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await shiftService.deleteShift(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
