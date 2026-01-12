import { Project } from "../models/index.js";

export const createProject = async (data) => {
  const project = new Project(data);
  await project.save();
  return project;
};

export const getAllProjects = async () => {
  const projects = await Project.find().sort({ createdAt: -1 });
  return projects;
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id);
  return project;
};

export const updateProject = async (id, data) => {
  const updated = await Project.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true }
  );
  if (!updated) {
    throw new Error("Project not found");
  }
  return updated;
};

export const deleteProject = async (id) => {
  const deleted = await Project.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Project not found");
  }
  return deleted;
};
