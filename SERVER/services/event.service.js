import { Event } from "../models/index.js";

export const createEvent = async (data) => {
  const event = new Event(data);
  await event.save();
  return event;
};

export const getProjectEvents = async (projectId) => {
  const events = await Event.find({ projectId }).sort({ createdAt: -1 });
  return events;
};

export const updateEvent = async (id, data) => {
  const updated = await Event.findByIdAndUpdate(id, data, { new: true });
  if (!updated) {
    throw new Error("Event not found");
  }
  return updated;
};

export const deleteEvent = async (id) => {
  const deleted = await Event.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Event not found");
  }
  return deleted;
};

// Export all functions as a service object
export const eventService = {
  createEvent,
  getProjectEvents,
  updateEvent,
  deleteEvent,
};
