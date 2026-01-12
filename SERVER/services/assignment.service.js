import { Worker, Project, Task } from "../models/index.js";

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
  const managers = await Worker.find({
    role: "MANAGER",
    status: "ACTIVE"
  }).lean();

  const managersWithScores = managers.map((manager) => {
    const skills = Array.isArray(manager.skills)
      ? manager.skills
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
  const manager = await Worker.findById(managerId);

  if (!manager) {
    throw new Error("Manager not found");
  }

  if (!["MANAGER", "ADMIN"].includes(manager.role)) {
    throw new Error("Worker must be a MANAGER or ADMIN to lead a project");
  }

  // Update project with project leader
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      projectLeaderId: managerId,
      updatedAt: new Date(),
    },
    { new: true }
  ).populate('projectLeaderId', 'firstname lastname email');

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
  const workers = await Worker.find({
    status: "ACTIVE"
  }).lean();

  const workersWithScores = workers
    .filter((worker) => ["WORKER", "VOLUNTEER"].includes(worker.role))
    .map((worker) => {
      const skills = Array.isArray(worker.skills)
        ? worker.skills
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
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  // Remove existing assignments
  task.assignments = [];

  // Create new assignments
  const assignments = workerIds.map((workerId) => ({
    workerId,
    assignedAt: new Date(),
  }));

  task.assignments = assignments;
  await task.save();

  return task.assignments;
};

/**
 * Get project with leader details and team composition
 * @param {string} projectId - Project ID
 * @returns {Object} Project with leader and team details
 */
export const getProjectWithTeam = async (projectId) => {
  const project = await Project.findById(projectId).populate('projectLeaderId', 'firstname lastname email role');

  if (!project) {
    throw new Error("Project not found");
  }

  // Get all tasks for this project with assignments
  const tasks = await Task.find({ projectId })
    .populate('assignments.workerId', 'firstname lastname email skills')
    .populate('createdBy', 'firstname lastname');

  // Get all unique workers assigned to tasks in this project
  const assignedWorkerIds = new Set();
  tasks.forEach(task => {
    task.assignments.forEach(assignment => {
      assignedWorkerIds.add(assignment.workerId._id.toString());
    });
  });

  const assignedWorkers = await Worker.find({
    _id: { $in: Array.from(assignedWorkerIds) }
  }).select('firstname lastname email role skills');

  return {
    ...project.toObject(),
    tasks: tasks.map(task => ({
      ...task.toObject(),
      assignedWorkers: task.assignments.map(a => a.workerId)
    })),
    assignedWorkers,
    teamSize: assignedWorkers.length,
  };
};
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
  const manager = await Worker.findById(managerId);

  if (!manager) {
    throw new Error("Manager not found");
  }

  if (!["MANAGER", "ADMIN"].includes(manager.role)) {
    throw new Error("Worker must be a MANAGER or ADMIN to lead a project");
  }

  // Update project with project leader
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      projectLeaderId: managerId,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!updatedProject) {
    throw new Error("Project not found");
  }

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
  const workers = await Worker.find({ status: "ACTIVE" });

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
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  // Create new assignments
  const assignments = workerIds.map((workerId) => ({
    workerId,
    assignedAt: new Date(),
  }));

  // Update task with new assignments
  task.assignments = assignments;
  await task.save();

  return assignments;
};

/**
 * Get project with leader details and team composition
 * @param {string} projectId - Project ID
 * @returns {Object} Project with leader and team details
 */
export const getProjectWithTeam = async (projectId) => {
  const project = await Project.findById(projectId).populate('projectLeaderId', 'firstname lastname email role department skills');

  if (!project) {
    throw new Error("Project not found");
  }

  // Get all tasks for this project with populated assignments
  const tasks = await Task.find({ projectId }).populate('assignments.workerId', 'firstname lastname email role department skills');

  // Get unique workers from task assignments
  const workerMap = new Map();
  tasks.forEach((task) => {
    if (task.assignments) {
      task.assignments.forEach((assignment) => {
        if (assignment.workerId && !workerMap.has(assignment.workerId._id.toString())) {
          workerMap.set(assignment.workerId._id.toString(), {
            id: assignment.workerId._id,
            name: `${assignment.workerId.firstname} ${assignment.workerId.lastname}`,
            email: assignment.workerId.email,
            role: assignment.workerId.role,
            department: assignment.workerId.department,
            skills: Array.isArray(assignment.workerId.skills) ? assignment.workerId.skills : [],
          });
        }
      });
    }
  });

  const team = Array.from(workerMap.values());

  return {
    ...project.toObject(),
    requiredSkills: Array.isArray(project.requiredSkills) ? project.requiredSkills : [],
    projectLeader: project.projectLeaderId
      ? {
          id: project.projectLeaderId._id,
          name: `${project.projectLeaderId.firstname} ${project.projectLeaderId.lastname}`,
          email: project.projectLeaderId.email,
          role: project.projectLeaderId.role,
          department: project.projectLeaderId.department,
          skills: Array.isArray(project.projectLeaderId.skills) ? project.projectLeaderId.skills : [],
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
  const project = await Project.findById(projectId);

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
