export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'on-leave' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'present' | 'late' | 'absent' | 'half-day';
  workHours?: number;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  type: 'annual' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  reviewedBy?: string;
  reviewedOn?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assignedTo: string[];
  assignedToNames: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  createdAt: string;
  location?: string;
  tags: string[];
}

export interface DailyReport {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  tasksSummary: string;
  challenges: string;
  achievements: string;
  location: string;
  photosCount: number;
  submittedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  teamSize: number;
  progress: number;
}

export interface DashboardStats {
  totalStaff: number;
  presentToday: number;
  onLeave: number;
  pendingLeaves: number;
  activeTasks: number;
  completedTasks: number;
  activeProjects: number;
  reportsToday: number;
}
