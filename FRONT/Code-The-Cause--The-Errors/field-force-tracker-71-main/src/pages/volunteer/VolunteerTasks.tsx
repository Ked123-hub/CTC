import { useState } from 'react';
import { VolunteerLayout } from '@/components/layout/VolunteerLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { mockTasks, mockProjects } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Tag, CheckCircle, Clock, AlertCircle, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/15 text-info border border-info/30',
  high: 'bg-warning/15 text-warning border border-warning/30',
  urgent: 'bg-destructive/15 text-destructive border border-destructive/30',
};

const statusConfig = {
  todo: { label: 'To Do', icon: ClipboardList, color: 'text-muted-foreground' },
  'in-progress': { label: 'In Progress', icon: Clock, color: 'text-info' },
  review: { label: 'Review', icon: AlertCircle, color: 'text-warning' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-success' },
};

export default function VolunteerTasks() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks.slice(0, 3)); // Assigned tasks from admin
  const [submittedTasks, setSubmittedTasks] = useState<Task[]>([]); // Tasks submitted by volunteer

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: '' as Task['priority'] | '',
    dueDate: '',
    location: '',
  });

  const allTasks = [...submittedTasks, ...tasks];
  
  const filteredTasks = allTasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.project || !formData.priority || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const projectName = mockProjects.find(p => p.id === formData.project)?.name || '';

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      project: projectName,
      assignedTo: [],
      assignedToNames: ['Me'],
      priority: formData.priority as Task['priority'],
      status: 'todo',
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      location: formData.location,
      tags: ['submitted'],
    };

    setSubmittedTasks(prev => [newTask, ...prev]);
    setFormData({ title: '', description: '', project: '', priority: '', dueDate: '', location: '' });
    setIsDialogOpen(false);
    toast.success('Task submitted successfully!');
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    setSubmittedTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    toast.success('Task status updated');
  };

  return (
    <VolunteerLayout title="My Tasks" subtitle="View assigned tasks and submit new ones">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between gap-4"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full sm:w-auto text-xs">
              <TabsTrigger value="all" className="px-2 sm:px-4">All</TabsTrigger>
              <TabsTrigger value="todo" className="px-2 sm:px-4">To Do</TabsTrigger>
              <TabsTrigger value="in-progress" className="px-2 sm:px-4">Active</TabsTrigger>
              <TabsTrigger value="review" className="px-2 sm:px-4">Review</TabsTrigger>
              <TabsTrigger value="completed" className="px-2 sm:px-4">Done</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Submit Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit New Task</DialogTitle>
                <DialogDescription>Add a task you've completed or started</DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input 
                    placeholder="Task title" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    placeholder="Describe the task..." 
                    rows={3} 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project *</label>
                    <Select value={formData.project} onValueChange={(val) => setFormData(prev => ({ ...prev, project: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority *</label>
                    <Select value={formData.priority} onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val as Task['priority'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date *</label>
                    <Input 
                      type="date" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      placeholder="Task location" 
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit}>
                    Submit Task
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tasks assigned to you will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, index) => {
                const status = statusConfig[task.status];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={cn('text-xs px-2 py-0.5 rounded-full', priorityColors[task.priority])}>
                                  {task.priority}
                                </span>
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <StatusIcon className={cn('h-3 w-3', status.color)} />
                                  {status.label}
                                </Badge>
                                {task.tags.includes('submitted') && (
                                  <Badge variant="secondary" className="text-xs">Submitted</Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-foreground">{task.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{task.project}</p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {task.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {task.location}
                              </span>
                            )}
                            {task.tags.filter(t => t !== 'submitted').length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" />
                                {task.tags.filter(t => t !== 'submitted').join(', ')}
                              </div>
                            )}
                          </div>

                          {/* Status Change Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            {task.status !== 'in-progress' && task.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, 'in-progress')}
                                className="text-xs"
                              >
                                Start Working
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, 'review')}
                                className="text-xs"
                              >
                                Submit for Review
                              </Button>
                            )}
                            {task.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStatusChange(task.id, 'completed')}
                                className="text-xs gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </VolunteerLayout>
  );
}
