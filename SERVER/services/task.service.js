import { eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  tasksTable,
  taskAssignmentsTable,
  taskUpdatesTable,
  workersTable,
  projectsTable,
} from "../models/index.js";

export const createTask = (data, createdBy) =>
  db
    .insert(tasksTable)
    .values({ ...data, createdBy })
    .returning();

export const getAllTasks = async () => {
  // Get all tasks
  const tasks = await db.select().from(tasksTable);

  if (tasks.length === 0) {
    return [];
  }

  // Get all task assignments in one query
  const taskIds = tasks.map((t) => t.id);
  const allAssignments =
    taskIds.length > 0
      ? await db
          .select({
            taskId: taskAssignmentsTable.taskId,
            workerId: taskAssignmentsTable.workerId,
            firstname: workersTable.firstname,
            lastname: workersTable.lastname,
          })
          .from(taskAssignmentsTable)
          .leftJoin(
            workersTable,
            eq(taskAssignmentsTable.workerId, workersTable.id)
          )
          .where(inArray(taskAssignmentsTable.taskId, taskIds))
      : [];

  // Get all project IDs and fetch project names
  const projectIds = [
    ...new Set(tasks.map((t) => t.projectId).filter(Boolean)),
  ];
  const projects =
    projectIds.length > 0
      ? await db
          .select({ id: projectsTable.id, name: projectsTable.name })
          .from(projectsTable)
          .where(inArray(projectsTable.id, projectIds))
      : [];

  // Group assignments by taskId
  const assignmentsByTask = {};
  for (const assignment of allAssignments) {
    if (!assignmentsByTask[assignment.taskId]) {
      assignmentsByTask[assignment.taskId] = [];
    }
    assignmentsByTask[assignment.taskId].push(assignment);
  }

  // Create project map
  const projectMap = {};
  for (const project of projects) {
    projectMap[project.id] = project.name;
  }

  // Enrich tasks with assignments and project names
  const enrichedTasks = tasks.map((task) => {
    const assignments = assignmentsByTask[task.id] || [];
    return {
      ...task,
      assignedTo: assignments.length > 0 ? assignments[0].workerId : null,
      assignedToNames: assignments
        .map((a) => `${a.firstname || ""} ${a.lastname || ""}`.trim())
        .filter(Boolean),
      project: task.projectId ? projectMap[task.projectId] || null : null,
      dueDate: task.plannedEnd ? task.plannedEnd.toISOString() : null,
    };
  });

  return enrichedTasks;
};

export const getTaskById = async (id) => {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id));

  if (!task) {
    return null;
  }

  // Get assigned workers
  const assignments = await db
    .select({
      workerId: taskAssignmentsTable.workerId,
      firstname: workersTable.firstname,
      lastname: workersTable.lastname,
    })
    .from(taskAssignmentsTable)
    .leftJoin(workersTable, eq(taskAssignmentsTable.workerId, workersTable.id))
    .where(eq(taskAssignmentsTable.taskId, id));

  // Get project name if projectId exists
  let projectName = null;
  if (task.projectId) {
    const [project] = await db
      .select({ name: projectsTable.name })
      .from(projectsTable)
      .where(eq(projectsTable.id, task.projectId));
    projectName = project?.name || null;
  }

  return {
    ...task,
    assignedTo: assignments.length > 0 ? assignments[0].workerId : null,
    assignedToNames: assignments.map((a) => `${a.firstname} ${a.lastname}`),
    project: projectName,
    dueDate: task.plannedEnd ? task.plannedEnd.toISOString() : null,
  };
};

export const getProjectTasks = (projectId) =>
  db.select().from(tasksTable).where(eq(tasksTable.projectId, projectId));

export const updateTask = (id, data) =>
  db.update(tasksTable).set(data).where(eq(tasksTable.id, id)).returning();

export const deleteTask = (id) =>
  db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();

export const assignTask = (data) =>
  db.insert(taskAssignmentsTable).values(data).returning();

export const addTaskUpdate = (data) =>
  db.insert(taskUpdatesTable).values(data).returning();

export const getTaskUpdates = (taskId) =>
  db.select().from(taskUpdatesTable).where(eq(taskUpdatesTable.taskId, taskId));
