import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { mockTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/15 text-info',
  high: 'bg-warning/15 text-warning',
  urgent: 'bg-destructive/15 text-destructive',
};

const statusColors = {
  todo: 'pending',
  'in-progress': 'info',
  review: 'warning',
  completed: 'success',
} as const;

export function TaskOverview() {
  const activeTasks = mockTasks.filter(t => t.status !== 'completed').slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Active Tasks</h3>
        <Badge variant="secondary">{activeTasks.length} tasks</Badge>
      </div>
      <div className="space-y-3">
        {activeTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.project}</p>
              </div>
              <Badge variant={statusColors[task.status]}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', priorityColors[task.priority])}>
                {task.priority}
              </span>
              <span className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
