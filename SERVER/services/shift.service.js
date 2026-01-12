import { Shift } from "../models/index.js";

export const createShift = async (data) => {
  const shift = new Shift(data);
  await shift.save();
  return shift;
};

export const getShiftsByProject = async (projectId) => {
  const shifts = await Shift.find({ projectId }).sort({ startTime: -1 });
  return shifts;
};

export const getShiftById = async (id) => {
  const shift = await Shift.findById(id);
  return shift ? [shift] : [];
};

export const updateShift = async (id, data) => {
  const updated = await Shift.findByIdAndUpdate(id, data, { new: true });
  if (!updated) {
    throw new Error("Shift not found");
  }
  return updated;
};

export const deleteShift = async (id) => {
  const deleted = await Shift.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Shift not found");
  }
  return deleted;
};
