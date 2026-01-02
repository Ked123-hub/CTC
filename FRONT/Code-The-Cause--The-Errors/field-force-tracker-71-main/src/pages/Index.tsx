import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TaskOverview } from "@/components/dashboard/TaskOverview";
import { AttendanceMap } from "@/components/dashboard/AttendanceMap";
import LocationTrackerComponent from "@/components/dashboard/LocationTracker";
import { mockDashboardStats } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  Users,
  Clock,
  Calendar,
  ClipboardList,
  FileText,
  FolderOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const stats = mockDashboardStats;

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // For non-admin users, redirect to appropriate dashboard
  if (user && user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user && user.role === "WORKER") {
    return <Navigate to="/volunteer" replace />;
  }

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Welcome back! Here's what's happening today - ${new Date().toLocaleDateString(
        "en-US",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )}`}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatsCard
          title="Total Staff"
          value={stats.totalStaff}
          icon={Users}
          variant="default"
          delay={0}
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          icon={Clock}
          trend={{ value: 12, isPositive: true }}
          variant="success"
          delay={0.05}
        />
        <StatsCard
          title="On Leave"
          value={stats.onLeave}
          icon={Calendar}
          variant="warning"
          delay={0.1}
        />
        <StatsCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={AlertCircle}
          variant="info"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatsCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon={ClipboardList}
          variant="primary"
          delay={0.2}
        />
        <StatsCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
          variant="success"
          delay={0.25}
        />
        <StatsCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderOpen}
          variant="info"
          delay={0.3}
        />
        <StatsCard
          title="Reports Today"
          value={stats.reportsToday}
          icon={FileText}
          variant="default"
          delay={0.35}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TaskOverview />
        <RecentActivity />
        {/* Quick Actions */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <QuickActionButton
              icon={Clock}
              label="Mark Attendance"
              href="/attendance"
            />
            <QuickActionButton
              icon={Calendar}
              label="Request Leave"
              href="/leave"
            />
            <QuickActionButton
              icon={ClipboardList}
              label="Create Task"
              href="/tasks"
            />
            <QuickActionButton
              icon={FileText}
              label="Submit Report"
              href="/reports"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

function QuickActionButton({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-[1.02] group"
    >
      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground text-center">
        {label}
      </span>
    </a>
  );
}

export default Index;
