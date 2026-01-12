import { Task, Worker, Project } from "../models/index.js";

export const createTask = async (data, createdBy) => {
  const task = new Task({ ...data, createdBy });
  await task.save();
  return task;
};

export const getAllTasks = async () => {
  const tasks = await Task.find()
    .populate('assignments.workerId', 'firstname lastname')
    .populate('projectId', 'name')
    .sort({ createdAt: -1 });

  // Enrich tasks with formatted data
  const enrichedTasks = tasks.map((task) => ({
    ...task.toObject(),
    assignedTo: task.assignments.length > 0 ? task.assignments[0].workerId._id : null,
    assignedToNames: task.assignments
      .map((a) => `${a.workerId.firstname || ""} ${a.workerId.lastname || ""}`.trim())
      .filter(Boolean),
    project: task.projectId ? task.projectId.name : null,
    dueDate: task.plannedEnd ? task.plannedEnd.toISOString() : null,
  }));

  return enrichedTasks;
};

export const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('assignments.workerId', 'firstname lastname')
    .populate('projectId', 'name');

  if (!task) {
    return null;
  }

  return {
    ...task.toObject(),
    assignedTo: task.assignments.length > 0 ? task.assignments[0].workerId._id : null,
    assignedToNames: task.assignments.map((a) => `${a.workerId.firstname} ${a.workerId.lastname}`),
    project: task.projectId ? task.projectId.name : null,
    dueDate: task.plannedEnd ? task.plannedEnd.toISOString() : null,
  };
};

export const getProjectTasks = async (projectId) => {
  const tasks = await Task.find({ projectId })
    .populate('assignments.workerId', 'firstname lastname')
    .sort({ createdAt: -1 });

  return tasks;
};

export const updateTask = async (id, data) => {
  const updated = await Task.findByIdAndUpdate(id, data, { new: true });
  if (!updated) {
    throw new Error("Task not found");
  }
  return updated;
};

export const deleteTask = async (id) => {
  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Task not found");
  }
  return deleted;
};

export const assignTask = async (data) => {
  const task = await Task.findById(data.taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  // Add assignment to task
  task.assignments.push({
    workerId: data.workerId,
    assignedAt: new Date(),
  });

  await task.save();
  return task.assignments[task.assignments.length - 1];
};

export const addTaskUpdate = async (data) => {
  const task = await Task.findById(data.taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  // Add update to task
  task.updates.push({
    ...data,
    updatedAt: new Date(),
  });

  await task.save();
  return task.updates[task.updates.length - 1];
};

export const getTaskUpdates = async (taskId) => {
  const task = await Task.findById(taskId).select('updates');
  if (!task) {
    throw new Error("Task not found");
  }

  return task.updates;
};
