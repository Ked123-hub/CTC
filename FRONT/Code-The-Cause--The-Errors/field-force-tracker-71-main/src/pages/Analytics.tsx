import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Clock, Calendar, FileText, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
} from 'recharts';

const attendanceData = [
  { day: 'Mon', present: 5, late: 1, absent: 0 },
  { day: 'Tue', present: 4, late: 1, absent: 1 },
  { day: 'Wed', present: 6, late: 0, absent: 0 },
  { day: 'Thu', present: 5, late: 1, absent: 0 },
  { day: 'Fri', present: 5, late: 0, absent: 1 },
];

const taskCompletionData = [
  { week: 'Week 1', completed: 12, assigned: 15 },
  { week: 'Week 2', completed: 18, assigned: 20 },
  { week: 'Week 3', completed: 15, assigned: 18 },
  { week: 'Week 4', completed: 22, assigned: 25 },
];

const departmentData = [
  { name: 'Waste Collection', value: 35, color: 'hsl(158, 64%, 32%)' },
  { name: 'Recycling', value: 28, color: 'hsl(174, 60%, 45%)' },
  { name: 'Awareness', value: 22, color: 'hsl(38, 92%, 50%)' },
  { name: 'Operations', value: 15, color: 'hsl(210, 20%, 60%)' },
];

const performanceData = [
  { month: 'Jan', efficiency: 78 },
  { month: 'Feb', efficiency: 82 },
  { month: 'Mar', efficiency: 75 },
  { month: 'Apr', efficiency: 88 },
  { month: 'May', efficiency: 85 },
  { month: 'Jun', efficiency: 92 },
];

export default function Analytics() {
  return (
    <MainLayout title="Analytics" subtitle="Performance insights and operational metrics">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex gap-3">
          <Select defaultValue="week">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg. Attendance Rate', value: '94%', trend: 3, icon: Users, positive: true },
          { label: 'Task Completion', value: '87%', trend: 8, icon: Target, positive: true },
          { label: 'Avg. Work Hours', value: '8.2h', trend: -2, icon: Clock, positive: false },
          { label: 'Reports Submitted', value: '156', trend: 12, icon: FileText, positive: true },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <div className={cn(
                      'flex items-center gap-1 text-xs mt-1',
                      item.positive ? 'text-success' : 'text-destructive'
                    )}>
                      {item.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(item.trend)}% vs last period
                    </div>
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
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance</CardTitle>
              <CardDescription>Staff attendance breakdown by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" fill="hsl(142, 70%, 45%)" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="hsl(38, 92%, 50%)" name="Late" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="hsl(0, 72%, 51%)" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Completion Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Rate</CardTitle>
              <CardDescription>Weekly task completion vs assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="assigned"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted))"
                    name="Assigned"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(158, 64%, 32%)"
                    fill="hsl(158, 64%, 32% / 0.3)"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Staff by Department</CardTitle>
              <CardDescription>Distribution of field staff across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Operational Efficiency</CardTitle>
              <CardDescription>Monthly efficiency score trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} domain={[60, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="hsl(158, 64%, 32%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(158, 64%, 32%)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(158, 64%, 32%)' }}
                    name="Efficiency %"
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
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Top Performers This Month
            </CardTitle>
            <CardDescription>Staff with highest productivity and attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { rank: 1, name: 'Priya Sharma', metric: '98% attendance', tasks: 24, badge: '🥇' },
                { rank: 2, name: 'Amit Verma', metric: '96% attendance', tasks: 22, badge: '🥈' },
                { rank: 3, name: 'Rahul Patel', metric: '94% attendance', tasks: 20, badge: '🥉' },
              ].map((performer, index) => (
                <div
                  key={performer.rank}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border',
                    index === 0 && 'bg-warning/10 border-warning/30',
                    index === 1 && 'bg-muted/50',
                    index === 2 && 'bg-muted/30'
                  )}
                >
                  <span className="text-2xl">{performer.badge}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">{performer.metric}</p>
                    <p className="text-xs text-muted-foreground">{performer.tasks} tasks completed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
