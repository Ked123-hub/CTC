export const formatAttendanceRecord = (record) => ({
  id: record.id,
  workerId: record.workerId,
  projectId: record.projectId,
  shiftId: record.shiftId,
  checkInAt: record.checkInAt?.toISOString(),
  checkOutAt: record.checkOutAt?.toISOString(),
  checkInLocation:
    record.checkInLat && record.checkInLng
      ? {
          lat: record.checkInLat,
          lng: record.checkInLng,
        }
      : null,
  checkOutLocation:
    record.checkOutLat && record.checkOutLng
      ? {
          lat: record.checkOutLat,
          lng: record.checkOutLng,
        }
      : null,
  method: record.method,
  status: record.status,
  createdAt: record.createdAt?.toISOString(),
});

export const formatAttendanceList = (records) =>
  records.map(formatAttendanceRecord);
