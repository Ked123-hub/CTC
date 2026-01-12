import { Router } from "express";
import { z } from "zod";
import { inventoryService } from "../services/inventory.service.js";
import { verifyToken } from "../auth/middleware.js";

const router = Router();

const inventorySchema = z.object({
  projectId: z.string().min(1, "Invalid project ID"),
  itemName: z.string().min(1, "Item name required"),
  category: z.string().optional(),
  quantityAvailable: z.number().int().min(0),
  unit: z.string().optional(),
  location: z.string().optional(),
});

const logSchema = z.object({
  inventoryId: z.string().min(1, "Invalid inventory ID"),
  changeQty: z.number().int(),
  reason: z.string().optional(),
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const validated = inventorySchema.parse(req.body);
    const item = await inventoryService.createInventoryItem(validated);
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const items = await inventoryService.getProjectInventory(req.params.projectId);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logs", verifyToken, async (req, res) => {
  try {
    const validated = logSchema.parse(req.body);
    const log = await inventoryService.logInventoryChange(validated, req.worker?.sub);
    res.status(201).json(log);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: err.errors[0].message });
    res.status(400).json({ error: err.message });
  }
});

export default router;
