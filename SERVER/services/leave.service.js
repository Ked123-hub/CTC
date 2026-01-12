import { LeaveRequest } from "../models/index.js";

export const createLeaveRequest = async (data) => {
  const leaveRequest = new LeaveRequest(data);
  await leaveRequest.save();
  return leaveRequest;
};

export const getWorkerLeaves = async (workerId) => {
  const leaves = await LeaveRequest.find({ workerId }).sort({ createdAt: -1 });
  return leaves;
};

export const getAllLeaveRequests = async () => {
  const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
  return leaves;
};

export const updateLeaveStatus = async (id, status, updatedBy) => {
  const updated = await LeaveRequest.findByIdAndUpdate(
    id,
    { 
      status,
      updatedAt: new Date(),
      updatedBy
    },
    { new: true }
  );
  
  if (!updated) {
    throw new Error("Leave request not found");
  }
  
  return updated;
};

// Export all functions as a service object
export const leaveService = {
  createLeaveRequest,
  getWorkerLeaves,
  getAllLeaveRequests,
  updateLeaveStatus,
};
