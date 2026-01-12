import { Inventory } from "../models/index.js";

export const createInventoryItem = async (data) => {
  const inventoryItem = new Inventory(data);
  await inventoryItem.save();
  return inventoryItem;
};

export const getProjectInventory = async (projectId) => {
  const inventory = await Inventory.find({ projectId }).sort({ createdAt: -1 });
  return inventory;
};

export const logInventoryChange = async (data, workerId) => {
  const inventoryItem = await Inventory.findById(data.inventoryId);
  if (!inventoryItem) {
    throw new Error("Inventory item not found");
  }

  // Add log entry to inventory item
  inventoryItem.logs.push({
    ...data,
    workerId,
    changedAt: new Date(),
  });

  await inventoryItem.save();
  return inventoryItem.logs[inventoryItem.logs.length - 1];
};

export const getInventoryLogs = async (inventoryId) => {
  const inventoryItem = await Inventory.findById(inventoryId).select('logs');
  if (!inventoryItem) {
    throw new Error("Inventory item not found");
  }

  return inventoryItem.logs;
};

// Export all functions as a service object
export const inventoryService = {
  createInventoryItem,
  getProjectInventory,
  logInventoryChange,
  getInventoryLogs,
};
