import { motion } from 'framer-motion';
import { Clock, FileText, Calendar, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'attendance',
    message: 'Priya Sharma checked in at Andheri West',
    time: '08:45 AM',
    icon: Clock,
  },
  {
    id: 2,
    type: 'report',
    message: 'Rahul Patel submitted daily report',
    time: '06:15 PM',
    icon: FileText,
  },
  {
    id: 3,
    type: 'leave',
    message: 'Leave request from Vikram Singh (pending)',
    time: '09:30 AM',
    icon: Calendar,
  },
  {
    id: 4,
    type: 'task',
    message: 'Equipment Maintenance marked complete',
    time: 'Yesterday',
    icon: CheckCircle,
  },
];

const typeColors = {
  attendance: 'bg-primary/10 text-primary',
  report: 'bg-info/10 text-info',
  leave: 'bg-warning/10 text-warning',
  task: 'bg-success/10 text-success',
};

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl border bg-card p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className={cn('rounded-lg p-2', typeColors[activity.type as keyof typeof typeColors])}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
