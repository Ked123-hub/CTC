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
