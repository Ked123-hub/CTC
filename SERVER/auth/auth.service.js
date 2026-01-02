import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { workersTable } from "../models/index.js";

export const hashPassword = (password) => bcrypt.hash(password, 10);

export const verifyPassword = (password, hash) =>
  bcrypt.compare(password, hash ?? "");

export const signWorkerToken = (worker) =>
  jwt.sign(
    {
      sub: worker.id,
      email: worker.email,
      firstname: worker.firstname,
      lastname: worker.lastname,
      role: worker.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

export const createWorker = (values) =>
  db.insert(workersTable).values(values).returning();

export const findWorkerByEmail = (email) =>
  db.select().from(workersTable).where(eq(workersTable.email, email));
