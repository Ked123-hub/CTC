import { Worker } from "../models/index.js";

export const createWorker = async (data) => {
  const worker = new Worker(data);
  await worker.save();
  return worker;
};

export const getAllWorkers = async () => {
  const workers = await Worker.find().sort({ createdAt: -1 });
  return workers;
};

export const getWorkerById = async (id) => {
  const worker = await Worker.findById(id);
  return worker ? [worker] : [];
};

export const getWorkerByEmail = async (email) => {
  const worker = await Worker.findOne({ email });
  return worker ? [worker] : [];
};

export const updateWorker = async (id, data) => {
  const updated = await Worker.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true }
  );
  if (!updated) {
    throw new Error("Worker not found");
  }
  return updated;
};

export const deleteWorker = async (id) => {
  const deleted = await Worker.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Worker not found");
  }
  return deleted;
};
