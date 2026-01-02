import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { eventsTable } from "../models/index.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

const eventSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
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
    const [event] = await db.insert(eventsTable).values(validated).returning();
    res.status(201).json(event);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const events = await db
      .select()
      .from(eventsTable)
      .where(eventsTable.projectId.eq(req.params.projectId));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validated = eventSchema.partial().parse(req.body);
    const [updated] = await db
      .update(eventsTable)
      .set(validated)
      .where(eventsTable.id.eq(req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

export default router;
