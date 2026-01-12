import { Router } from "express";
import { z } from "zod";
import { eventService } from "../services/event.service.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

const eventSchema = z.object({
  projectId: z.string().min(1, "Invalid project ID"),
  title: z.string().min(1, "Event title required"),
  type: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  locationLat: z.string().optional(),
  locationLng: z.string().optional(),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = eventSchema.parse(req.body);
    const event = await eventService.createEvent(validated);
    res.status(201).json(event);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const events = await eventService.getProjectEvents(req.params.projectId);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = eventSchema.partial().parse(req.body);
    const updated = await eventService.updateEvent(req.params.id, validated);
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

export default router;
