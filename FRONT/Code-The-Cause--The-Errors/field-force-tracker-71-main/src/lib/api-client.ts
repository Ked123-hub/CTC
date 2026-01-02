import axios, { AxiosInstance, AxiosError } from "axios";

// Force the API URL to be localhost:3000 for local development to avoid env issues
const API_BASE_URL = "http://localhost:3000/api";

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      // Ensure any relative `/api` request is sent to the backend host (avoid preview origin)
      if (config.url && config.url.startsWith("/api")) {
        config.url = API_BASE_URL.replace(/\/$/, "") + config.url.slice(4);
        // Clear baseURL so axios does not combine it with the current origin
        config.baseURL = "";
      }
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle auth
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }

        // Handle cases where server returned an empty body with non-JSON content
        // (prevents "Unexpected end of JSON input" when backend sends empty 404/204)
        const resp = (error as any).response;
        if (resp && resp.data === "" && resp.status && resp.status >= 400) {
          resp.data = null;
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic helper
  async get(url: string, config?: any) {
    return this.client.get(url, config);
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.client.post("/auth/login", { email, password });
  }

  async logout() {
    return this.client.post("/auth/logout");
  }

  async verifyAuth() {
    return this.client.get("/auth/verify");
  }

  async register(email: string, password: string, name: string) {
    return this.client.post("/auth/register", { email, password, name });
  }

  async signup(data: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) {
    return this.client.post("/auth/signup", data);
  }

  // Attendance endpoints
  async getAttendance(params?: any) {
    // If asking for a worker's attendance use the worker-specific endpoint
    if (params && params.workerId) {
      return this.client.get(`/attendance/worker/${params.workerId}`);
    }
    if (params && params.projectId) {
      return this.client.get(`/attendance/project/${params.projectId}`);
    }
    return this.client.get("/attendance", { params });
  }

  async checkIn(data: any) {
    return this.client.post("/attendance/checkin", data);
  }

  async checkOut(attendanceId: string, data?: any) {
    return this.client.patch(`/attendance/${attendanceId}/checkout`, data);
  }

  // Location endpoints
  async updateLocation(data: any) {
    return this.client.post("/location/update", data);
  }

  async getActiveWorkers(projectId: string) {
    return this.client.get(`/location/project/${projectId}/active`);
  }

  async getLocationHistory(workerId: string) {
    return this.client.get(`/location/worker/${workerId}/history`);
  }

  async optimizeRoute(data: any) {
    return this.client.post("/location/optimize-route", data);
  }

  async validateCheckIn(data: any) {
    return this.client.post("/location/validate-checkin", data);
  }

  async calculateDistance(origin: any, destination: any) {
    return this.client.post("/location/distance", { origin, destination });
  }

  async geocode(address: string) {
    return this.client.post("/location/geocode", { address });
  }

  async reverseGeocode(latitude: number, longitude: number) {
    return this.client.post("/location/reverse-geocode", {
      latitude,
      longitude,
    });
  }

  // Notifications
  async createNotification(data: any) {
    return this.client.post("/notifications", data);
  }

  async getStoryRequestsCount() {
    return this.client.get("/notifications/story-requests/count");
  }

  async getDirections(origin: string, destination: string) {
    return this.client.post("/location/directions", { origin, destination });
  }

  // Task endpoints
  async getTasks(params?: any) {
    const response = await this.client.get("/tasks", { params });
    return response;
  }

  async getTask(id: string) {
    try {
      const response = await this.client.get(`/tasks/${id}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async createTask(data: any) {
    return this.client.post("/tasks", data);
  }

  async updateTask(id: string, data: any) {
    return this.client.patch(`/tasks/${id}`, data);
  }

  async deleteTask(id: string) {
    return this.client.delete(`/tasks/${id}`);
  }

  async assignTask(data: { taskId: string; workerId: string }) {
    return this.client.post("/tasks/assign", data);
  }

  // Leave endpoints
  async getLeaveRequests(params?: any) {
    if (params && params.workerId) {
      return this.client.get(`/leave-requests/worker/${params.workerId}`);
    }
    return this.client.get("/leave-requests", { params });
  }

  async createLeaveRequest(data: any) {
    return this.client.post("/leave-requests", data);
  }

  async approveLeaveRequest(id: string) {
    return this.client.put(`/leave-requests/${id}/approve`);
  }

  async rejectLeaveRequest(id: string, reason: string) {
    return this.client.put(`/leave-requests/${id}/reject`, { reason });
  }

  // Analytics endpoints
  async getDashboard(projectId: string) {
    return this.client.get(`/analytics/dashboard/${projectId}`);
  }

  async getAttendanceStats(
    projectId: string,
    params?: { startDate?: string; endDate?: string }
  ) {
    return this.client.get(`/analytics/attendance/${projectId}`, { params });
  }

  async getAttendanceBreakdown(
    projectId: string,
    params?: { startDate?: string; endDate?: string }
  ) {
    return this.client.get(`/analytics/attendance/${projectId}/breakdown`, {
      params,
    });
  }

  async getTaskMetrics(projectId: string) {
    return this.client.get(`/analytics/tasks/${projectId}`);
  }

  async getLeaveStats(params?: { startDate?: string; endDate?: string }) {
    return this.client.get("/analytics/leaves", { params });
  }

  async getProjectProgress(projectId: string) {
    return this.client.get(`/analytics/project/${projectId}/progress`);
  }

  async getDailyReportsSummary(
    projectId: string,
    params?: { startDate?: string; endDate?: string }
  ) {
    return this.client.get(`/analytics/reports/${projectId}`, { params });
  }

  async getWorkerPerformance(workerId: string) {
    return this.client.get(`/analytics/worker/${workerId}/performance`);
  }

  // Project endpoints
  async getProjects() {
    return this.client.get("/projects");
  }

  async getProject(id: string) {
    return this.client.get(`/projects/${id}`);
  }

  // Worker endpoints
  async getWorkers(params?: any) {
    return this.client.get("/workers", { params });
  }

  async getWorker(id: string) {
    return this.client.get(`/workers/${id}`);
  }

  async updateWorker(id: string, data: any) {
    return this.client.patch(`/workers/${id}`, data);
  }

  // Project endpoints (create/update/delete)
  async createProject(data: any) {
    return this.client.post("/projects", data);
  }

  async updateProject(id: string, data: any) {
    return this.client.patch(`/projects/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.client.delete(`/projects/${id}`);
  }
}

export const apiClient = new APIClient();
export default apiClient;
