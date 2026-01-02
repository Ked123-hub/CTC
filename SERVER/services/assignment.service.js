import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  workersTable,
  projectsTable,
  tasksTable,
  taskAssignmentsTable,
} from "../models/index.js";

/**
 * Calculate skill match score between required skills and worker skills
 * @param {Array} requiredSkills - Skills needed for the project/task
 * @param {Array} workerSkills - Skills the worker has
 * @returns {number} Match score (0-100)
 */
function calculateSkillMatchScore(requiredSkills, workerSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!workerSkills || workerSkills.length === 0) return 0;

  const matchedSkills = requiredSkills.filter((skill) =>
    workerSkills.includes(skill)
  );
  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

/**
 * Find suitable managers for a project based on required skills
 * @param {Array} requiredSkills - Skills needed for the project
 * @returns {Array} Sorted list of managers with match scores
 */
export const findSuitableManagers = async (requiredSkills) => {
  const managers = await db
    .select()
    .from(workersTable)
    .where(
      and(eq(workersTable.role, "MANAGER"), eq(workersTable.status, "ACTIVE"))
    );

  const managersWithScores = managers.map((manager) => {
    const skills = Array.isArray(manager.skills)
      ? manager.skills
      : typeof manager.skills === "string"
      ? JSON.parse(manager.skills)
      : [];

    const matchScore = calculateSkillMatchScore(requiredSkills, skills);

    return {
      ...manager,
      skills,
      matchScore,
      matchedSkills: requiredSkills.filter((skill) => skills.includes(skill)),
      missingSkills: requiredSkills.filter((skill) => !skills.includes(skill)),
    };
  });

  // Sort by match score (descending)
  return managersWithScores.sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Assign a manager as project leader
 * @param {string} projectId - Project ID
 * @param {string} managerId - Manager/Worker ID
 * @returns {Object} Updated project
 */
export const assignProjectLeader = async (projectId, managerId) => {
  // Verify the manager exists and has appropriate role
  const [manager] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.id, managerId));

  if (!manager) {
    throw new Error("Manager not found");
  }

  if (!["MANAGER", "ADMIN"].includes(manager.role)) {
    throw new Error("Worker must be a MANAGER or ADMIN to lead a project");
  }

  // Update project with project leader
  const [updatedProject] = await db
    .update(projectsTable)
    .set({
      projectLeaderId: managerId,
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.id, projectId))
    .returning();

  return updatedProject;
};

/**
 * Find suitable workers for a task based on required skills
 * @param {string} projectId - Project ID (to filter workers from same project)
 * @param {Array} requiredSkills - Skills needed for the task
 * @returns {Array} Sorted list of workers with match scores
 */
export const findSuitableWorkers = async (projectId, requiredSkills) => {
  // Get all active workers (excluding admins/managers unless specified)
  const workers = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.status, "ACTIVE"));

  const workersWithScores = workers
    .filter((w) => ["WORKER", "VOLUNTEER"].includes(w.role))
    .map((worker) => {
      const skills = Array.isArray(worker.skills)
        ? worker.skills
        : typeof worker.skills === "string"
        ? JSON.parse(worker.skills)
        : [];

      const matchScore = calculateSkillMatchScore(requiredSkills, skills);

      return {
        ...worker,
        skills,
        matchScore,
        matchedSkills: requiredSkills.filter((skill) => skills.includes(skill)),
        missingSkills: requiredSkills.filter(
          (skill) => !skills.includes(skill)
        ),
      };
    });

  // Sort by match score (descending)
  return workersWithScores.sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Assign workers to a task
 * @param {string} taskId - Task ID
 * @param {Array} workerIds - Array of worker IDs to assign
 * @returns {Array} Created task assignments
 */
export const assignWorkersToTask = async (taskId, workerIds) => {
  // Verify task exists
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId));

  if (!task) {
    throw new Error("Task not found");
  }

  // Remove existing assignments
  await db
    .delete(taskAssignmentsTable)
    .where(eq(taskAssignmentsTable.taskId, taskId));

  // Create new assignments
  const assignments = await db
    .insert(taskAssignmentsTable)
    .values(
      workerIds.map((workerId) => ({
        taskId,
        workerId,
        assignedAt: new Date(),
      }))
    )
    .returning();

  return assignments;
};

/**
 * Get project with leader details and team composition
 * @param {string} projectId - Project ID
 * @returns {Object} Project with leader and team details
 */
export const getProjectWithTeam = async (projectId) => {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId));

  if (!project) {
    throw new Error("Project not found");
  }

  let projectLeader = null;
  if (project.projectLeaderId) {
    [projectLeader] = await db
      .select()
      .from(workersTable)
      .where(eq(workersTable.id, project.projectLeaderId));
  }

  // Get all tasks for this project
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.projectId, projectId));

  // Get all unique workers assigned to tasks in this project
  const taskIds = tasks.map((t) => t.id);
  const assignments =
    taskIds.length > 0
      ? await db
          .select({
            workerId: taskAssignmentsTable.workerId,
            firstname: workersTable.firstname,
            lastname: workersTable.lastname,
            email: workersTable.email,
            role: workersTable.role,
            department: workersTable.department,
            skills: workersTable.skills,
          })
          .from(taskAssignmentsTable)
          .leftJoin(
            workersTable,
            eq(taskAssignmentsTable.workerId, workersTable.id)
          )
          .where(
            sql`${taskAssignmentsTable.taskId} IN (${sql.join(
              taskIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
      : [];

  // Get unique workers
  const workerMap = new Map();
  assignments.forEach((assignment) => {
    if (!workerMap.has(assignment.workerId)) {
      workerMap.set(assignment.workerId, assignment);
    }
  });

  const team = Array.from(workerMap.values());

  return {
    ...project,
    requiredSkills: Array.isArray(project.requiredSkills)
      ? project.requiredSkills
      : [],
    projectLeader: projectLeader
      ? {
          id: projectLeader.id,
          name: `${projectLeader.firstname} ${projectLeader.lastname}`,
          email: projectLeader.email,
          role: projectLeader.role,
          department: projectLeader.department,
          skills: Array.isArray(projectLeader.skills)
            ? projectLeader.skills
            : [],
        }
      : null,
    team,
    teamCount: team.length,
  };
};

/**
 * Auto-assign best matching manager to a project
 * @param {string} projectId - Project ID
 * @returns {Object} Updated project with assigned manager
 */
export const autoAssignProjectLeader = async (projectId) => {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId));

  if (!project) {
    throw new Error("Project not found");
  }

  const requiredSkills = Array.isArray(project.requiredSkills)
    ? project.requiredSkills
    : [];

  const suitableManagers = await findSuitableManagers(requiredSkills);

  if (suitableManagers.length === 0) {
    throw new Error("No suitable managers found");
  }

  // Assign the best matching manager
  const bestManager = suitableManagers[0];
  return await assignProjectLeader(projectId, bestManager.id);
};
