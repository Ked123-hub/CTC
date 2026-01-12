import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Worker } from "../models/index.js";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash ?? "");
};

export const signWorkerToken = (worker) =>
  jwt.sign(
    {
      sub: worker._id.toString(),
      email: worker.email,
      firstname: worker.firstname,
      lastname: worker.lastname,
      role: worker.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

export const createWorker = async (values) => {
  const worker = new Worker(values);
  return await worker.save();
};

export const findWorkerByEmail = async (email) => {
  return await Worker.findOne({ email }).select('+passwordHash');
};

export const findWorkerById = async (id) => {
  return await Worker.findById(id);
};

export const updateWorkerLastLogin = async (workerId) => {
  return await Worker.findByIdAndUpdate(
    workerId,
    { lastLogin: new Date() },
    { new: true }
  );
};
