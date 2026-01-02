import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { apiClient } from "@/lib/api-client";
import {
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  CheckCircle,
  AlertCircle,
  UserCheck,
  FileText,
  MapPin,
  Activity,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  // Fetch workers
  const { data: workersData, isLoading: workersLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const response = await apiClient.getWorkers();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.getProjects();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Fetch active workers
  const { data: activeWorkersData } = useQuery({
    queryKey: ["activeWorkers"],
    queryFn: async () => {
      const response = await apiClient.get("/location/active-workers");
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Fetch leave requests
  const { data: leaveData } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: async () => {
      const response = await apiClient.getLeaveRequests();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Fetch story requests count (admin)
  const { data: storyRequestsData } = useQuery({
    queryKey: ["storyRequestsCount"],
    queryFn: async () => {
      const response = await apiClient.getStoryRequestsCount();
      return response.data?.data?.count ?? response.data ?? 0;
    },
  });

  // Fetch tasks
  const { data: tasksData } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks");
      return response.data?.data ?? response.data ?? [];
    },
  });

  const workers = workersData || [];
  const projects = projectsData || [];
  const activeWorkers = activeWorkersData || [];
  const leaveRequests = leaveData || [];
  const tasks = tasksData || [];

  const pendingLeaves = leaveRequests.filter(
    (l: any) => l.status === "PENDING"
  ).length;
  const pendingStoryRequests = storyRequestsData || 0;
  const activeTasks = tasks.filter(
    (t: any) => t.status === "IN_PROGRESS" || t.status === "PENDING"
  ).length;
  const completedTasks = tasks.filter(
    (t: any) => t.status === "COMPLETED"
  ).length;
  const activeLocations = projects.filter(
    (p: any) => p.status === "ACTIVE"
  ).length;

  const isLoading = workersLoading || projectsLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle={`Administrative overview - ${new Date().toLocaleDateString(
        "en-US",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )}`}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Staff"
          value={workers.length}
          icon={Users}
          variant="default"
          delay={0}
        />
        <StatsCard
          title="Active Tasks"
          value={activeTasks}
          icon={ClipboardList}
          variant="primary"
          delay={0.05}
        />
        <StatsCard
          title="Active Locations"
          value={activeLocations}
          icon={MapPin}
          variant="info"
          delay={0.1}
        />
        <StatsCard
          title="Staff Online"
          value={activeWorkers.length}
          icon={Activity}
          variant="success"
          delay={0.15}
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={AlertCircle}
          variant="warning"
          delay={0.2}
        />
        <StatsCard
          title="Story Requests"
          value={pendingStoryRequests}
          icon={FileText}
          variant="secondary"
          delay={0.225}
        />
        <StatsCard
          title="Task Completion"
          value={`${
            completedTasks + activeTasks > 0
              ? Math.round(
                  (completedTasks / (completedTasks + activeTasks)) * 100
                )
              : 0
          }%`}
          icon={CheckCircle}
          variant="success"
          delay={0.25}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        <QuickActionCard
          icon={BarChart3}
          title="View Analytics"
          description="Performance insights"
          href="/admin/analytics"
        />
        <QuickActionCard
          icon={MapPin}
          title="Manage Locations"
          description="Create & assign zones"
          href="/admin/locations"
        />
        <QuickActionCard
          icon={ClipboardList}
          title="Manage Tasks"
          description="Assign and track tasks"
          href="/admin/tasks"
        />
        <QuickActionCard
          icon={Calendar}
          title="Leave Requests"
          description="Review approvals"
          href="/admin/leave"
        />
        <QuickActionCard
          icon={Users}
          title="Staff Directory"
          description="Manage team members"
          href="/admin/staff"
        />
      </motion.div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActionItem
                label="Leave requests pending approval"
                count={pendingLeaves}
              />
              <ActionItem
                label="Tasks awaiting assignment"
                count={tasks.filter((t: any) => t.status === "PENDING").length}
              />
              <ActionItem label="Active projects" count={activeLocations} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-success" />
                Today's Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <OverviewItem
                label="Staff Online"
                value={`${activeWorkers.length}/${workers.length}`}
              />
              <OverviewItem
                label="Tasks Completed"
                value={completedTasks.toString()}
              />
              <OverviewItem
                label="Active Locations"
                value={activeLocations.toString()}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="group flex flex-col p-5 rounded-xl border bg-card hover:shadow-lg transition-all hover:scale-[1.02]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

function ActionItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm text-foreground">{label}</span>
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
        {count}
      </span>
    </div>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default AdminDashboard;
