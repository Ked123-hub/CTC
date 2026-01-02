import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  Target,
  FileText,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiClient } from "@/lib/api-client";

type RangeKey = "7d" | "30d" | "90d";

type Project = {
  id: string;
  name: string;
};

type AttendanceStats = {
  totalWorkers: number;
  totalCheckIns: number;
  avgDuration: number;
  presentDays: number;
  absentDays: number;
};

type AttendanceBreakdownItem = {
  workerId: string;
  workerName: string | null;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  avgHours: number;
};

type TaskMetrics = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  backlogTasks: number;
  avgProgress: number;
  completionRate: number | string;
};

type LeaveStats = {
  totalRequests: number;
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
};

type ReportSummary = {
  date: string;
  count: number;
  avgIssues: number;
};

const RANGE_OPTIONS: { label: string; value: RangeKey }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

const toISO = (date: Date) => date.toISOString();

const getRange = (range: RangeKey) => {
  const end = new Date();
  const start = new Date();

  if (range === "7d") start.setDate(end.getDate() - 7);
  if (range === "30d") start.setDate(end.getDate() - 30);
  if (range === "90d") start.setDate(end.getDate() - 90);

  return { start, end };
};

const formatDateLabel = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export default function AdminAnalytics() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [range, setRange] = useState<RangeKey>("30d");

  const dateRange = useMemo(() => getRange(range), [range]);

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: projectsError,
  } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.getProjects();
      return response.data;
    },
  });

  useEffect(() => {
    if (!selectedProjectId && projects.length) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  const attendanceStatsQuery = useQuery<AttendanceStats>({
    queryKey: ["analytics", "attendance", selectedProjectId, range],
    enabled: Boolean(selectedProjectId),
    queryFn: async () => {
      const response = await apiClient.getAttendanceStats(selectedProjectId!, {
        startDate: toISO(dateRange.start),
        endDate: toISO(dateRange.end),
      });
      return response.data?.data ?? response.data;
    },
  });

  const attendanceBreakdownQuery = useQuery<AttendanceBreakdownItem[]>({
    queryKey: ["analytics", "attendance", "breakdown", selectedProjectId, range],
    enabled: Boolean(selectedProjectId),
    queryFn: async () => {
      const response = await apiClient.getAttendanceBreakdown(selectedProjectId!, {
        startDate: toISO(dateRange.start),
        endDate: toISO(dateRange.end),
      });
      return response.data?.data ?? response.data;
    },
  });

  const taskMetricsQuery = useQuery<TaskMetrics>({
    queryKey: ["analytics", "tasks", selectedProjectId],
    enabled: Boolean(selectedProjectId),
    queryFn: async () => {
      const response = await apiClient.getTaskMetrics(selectedProjectId!);
      return response.data?.data ?? response.data;
    },
  });

  const leaveStatsQuery = useQuery<LeaveStats>({
    queryKey: ["analytics", "leaves", range],
    queryFn: async () => {
      const response = await apiClient.getLeaveStats({
        startDate: toISO(dateRange.start),
        endDate: toISO(dateRange.end),
      });
      return response.data?.data ?? response.data;
    },
  });

  const reportsQuery = useQuery<ReportSummary[]>({
    queryKey: ["analytics", "reports", selectedProjectId, range],
    enabled: Boolean(selectedProjectId),
    queryFn: async () => {
      const response = await apiClient.getDailyReportsSummary(selectedProjectId!, {
        startDate: toISO(dateRange.start),
        endDate: toISO(dateRange.end),
      });
      return response.data?.data ?? response.data;
    },
  });

  const isLoading =
    loadingProjects ||
    attendanceStatsQuery.isLoading ||
    attendanceBreakdownQuery.isLoading ||
    taskMetricsQuery.isLoading ||
    leaveStatsQuery.isLoading ||
    reportsQuery.isLoading;

  const error =
    projectsError ||
    attendanceStatsQuery.error ||
    attendanceBreakdownQuery.error ||
    taskMetricsQuery.error ||
    leaveStatsQuery.error ||
    reportsQuery.error;

  const attendanceStats = attendanceStatsQuery.data || {
    totalWorkers: 0,
    totalCheckIns: 0,
    avgDuration: 0,
    presentDays: 0,
    absentDays: 0,
  };

  const attendanceBreakdown = attendanceBreakdownQuery.data || [];
  const taskMetrics = taskMetricsQuery.data || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    blockedTasks: 0,
    backlogTasks: 0,
    avgProgress: 0,
    completionRate: 0,
  };
  const leaveStats = leaveStatsQuery.data || {
    totalRequests: 0,
    approvedLeaves: 0,
    pendingLeaves: 0,
    rejectedLeaves: 0,
  };
  const reportsSummary = reportsQuery.data || [];

  const attendanceRate = useMemo(() => {
    const totalDays = attendanceStats.presentDays + attendanceStats.absentDays;
    return totalDays ? (attendanceStats.presentDays / totalDays) * 100 : 0;
  }, [attendanceStats]);

  const taskCompletion = useMemo(() => {
    const value = Number(taskMetrics.completionRate ?? 0);
    return Number.isFinite(value) ? value : 0;
  }, [taskMetrics]);

  const avgWorkHours = Number(attendanceStats.avgDuration || 0);
  const totalReports = reportsSummary.reduce((sum, report) => sum + (report.count || 0), 0);

  const attendanceChartData = attendanceBreakdown.map((item) => ({
    name: item.workerName || "Unassigned",
    present: item.presentDays,
    absent: item.absentDays,
  }));

  const taskStatusData = [
    { label: "Completed", value: taskMetrics.completedTasks, color: "hsl(142, 70%, 45%)" },
    { label: "In Progress", value: taskMetrics.inProgressTasks, color: "hsl(38, 92%, 50%)" },
    { label: "Blocked", value: taskMetrics.blockedTasks, color: "hsl(0, 72%, 51%)" },
    { label: "Backlog", value: taskMetrics.backlogTasks, color: "hsl(210, 20%, 60%)" },
  ];

  const leaveChartData = [
    { name: "Approved", value: leaveStats.approvedLeaves, color: "hsl(142, 70%, 45%)" },
    { name: "Pending", value: leaveStats.pendingLeaves, color: "hsl(38, 92%, 50%)" },
    { name: "Rejected", value: leaveStats.rejectedLeaves, color: "hsl(0, 72%, 51%)" },
  ];

  const reportTrendData = reportsSummary.map((report) => ({
    date: formatDateLabel(report.date),
    count: report.count,
    avgIssues: Number(report.avgIssues || 0),
  }));

  const topPerformers = attendanceBreakdown
    .map((item) => {
      const totalDays = item.totalDays || item.presentDays + item.absentDays;
      const attendanceRate = totalDays ? (item.presentDays / totalDays) * 100 : 0;
      return { ...item, attendanceRate };
    })
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 3);

  const projectSnapshot = [
    { label: "Total Tasks", value: taskMetrics.totalTasks },
    { label: "Completed Tasks", value: taskMetrics.completedTasks },
    { label: "In Progress", value: taskMetrics.inProgressTasks },
    { label: "Active Workers", value: attendanceStats.totalWorkers },
    { label: "Avg Progress", value: `${Number(taskMetrics.avgProgress || 0).toFixed(1)}%` },
    { label: "Avg Hours Present", value: `${avgWorkHours.toFixed(1)}h` },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Analytics" subtitle="Loading analytics data...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics" subtitle="Error loading analytics">
        <div className="flex items-center justify-center h-64 text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Unable to load analytics data. Please try again.</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Analytics"
      subtitle={
        selectedProject
          ? `Performance insights for ${selectedProject.name}`
          : "Performance insights and operational metrics"
      }
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-6"
      >
        <div className="flex gap-3 w-full md:w-auto">
          <Select
            value={selectedProjectId}
            onValueChange={(value) => setSelectedProjectId(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={(value: RangeKey) => setRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Avg. Attendance Rate",
            value: `${attendanceRate.toFixed(1)}%`,
            icon: Users,
          },
          {
            label: "Task Completion",
            value: `${taskCompletion.toFixed(1)}%`,
            icon: Target,
          },
          {
            label: "Avg. Work Hours",
            value: `${avgWorkHours.toFixed(1)}h`,
            icon: Clock,
          },
          {
            label: "Reports Submitted",
            value: totalReports.toString(),
            icon: FileText,
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {item.value}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Worker</CardTitle>
              <CardDescription>
                Presence and absence for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" fill="hsl(142, 70%, 45%)" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="hsl(0, 72%, 51%)" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
              <CardDescription>Current task distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskStatusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leave Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Status distribution for the period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {leaveChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Daily Reports</CardTitle>
              <CardDescription>Submissions and average issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(158, 64%, 32%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(158, 64%, 32%)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(158, 64%, 32%)" }}
                    name="Reports"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgIssues"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(38, 92%, 50%)", strokeWidth: 2, r: 3 }}
                    name="Avg Issues"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Top Attendance (Period)
            </CardTitle>
            <CardDescription>Best attendance rates by worker</CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not enough attendance data yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPerformers.map((performer, index) => (
                  <div
                    key={performer.workerId}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border",
                      index === 0 && "bg-warning/10 border-warning/30",
                      index === 1 && "bg-muted/50",
                      index === 2 && "bg-muted/30"
                    )}
                  >
                    <span className="text-2xl">{index === 0 ? "" : index === 1 ? "" : ""}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {performer.workerName || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {performer.attendanceRate.toFixed(1)}% attendance
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {performer.presentDays} days present
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Project Snapshot</CardTitle>
              <CardDescription>
                Key metrics for {selectedProject?.name || "the selected project"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {projectSnapshot.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Daily Reports</CardTitle>
              <CardDescription>Volume and average issues logged</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportTrendData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reports submitted in this period.</p>
              ) : (
                reportTrendData
                  .slice(-6)
                  .reverse()
                  .map((report) => (
                    <div
                      key={report.date}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{report.date}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg issues: {report.avgIssues.toFixed(1)}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {report.count} reports
                      </span>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
