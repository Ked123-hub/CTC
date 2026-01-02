import { db } from "../db/index.js";
import { workersTable } from "../models/index.js";

// #region agent log
const logDebug = (location, message, data) => {
  fetch("http://127.0.0.1:7242/ingest/51d8f5a9-8cae-46e5-ba4d-366eec339780", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: "debug-session",
    }),
  }).catch(() => {});
};
// #endregion

export const createWorker = (data) =>
  db.insert(workersTable).values(data).returning();

export const getAllWorkers = () => db.select().from(workersTable);

export const getWorkerById = async (id) => {
  // #region agent log
  logDebug("worker.service.js:10", "getWorkerById called", {
    id,
    hypothesisId: "A",
  });
  // #endregion
  try {
    // #region agent log
    logDebug("worker.service.js:13", "Before database query", {
      id,
      queryType: "select",
      hypothesisId: "A",
    });
    // #endregion
    const result = await db
      .select()
      .from(workersTable)
      .where(workersTable.id.eq(id));
    // #region agent log
    logDebug("worker.service.js:16", "After database query", {
      id,
      resultCount: result?.length,
      firstResult: result?.[0]
        ? { id: result[0].id, firstname: result[0].firstname }
        : null,
      hypothesisId: "A",
    });
    // #endregion
    return result;
  } catch (error) {
    // #region agent log
    logDebug("worker.service.js:20", "Database query error", {
      id,
      errorMessage: error.message,
      errorStack: error.stack,
      hypothesisId: "A",
    });
    // #endregion
    throw error;
  }
};

export const getWorkerByEmail = (email) =>
  db.select().from(workersTable).where(workersTable.email.eq(email));

export const updateWorker = (id, data) =>
  db
    .update(workersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(workersTable.id.eq(id))
    .returning();

export const deleteWorker = (id) =>
  db.delete(workersTable).where(workersTable.id.eq(id));
