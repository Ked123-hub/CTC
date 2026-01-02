import { z } from "zod";

export const attendanceSchema = z.object({
  workerId: z.string().uuid("Invalid worker ID"),
  projectId: z.string().uuid("Invalid project ID").optional(),
  shiftId: z.string().uuid("Invalid shift ID").optional(),
  checkInAt: z.string().datetime().optional(),
  checkOutAt: z.string().datetime().optional(),
  checkInLat: z.string().optional(),
  checkInLng: z.string().optional(),
  checkOutLat: z.string().optional(),
  checkOutLng: z.string().optional(),
  method: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "PENDING"]).optional(),
});

export const checkoutSchema = z.object({
  checkOutLat: z.string().optional(),
  checkOutLng: z.string().optional(),
});
