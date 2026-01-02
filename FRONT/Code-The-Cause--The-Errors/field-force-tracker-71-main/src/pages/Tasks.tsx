import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockTasks, mockProjects } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Tag, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const statusColumns = [
  { id: 'todo', label: 'To Do', color: 'bg-muted' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-info/20' },
  { id: 'review', label: 'Review', color: 'bg-warning/20' },
  { id: 'completed', label: 'Completed', color: 'bg-success/20' },
];

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/15 text-info border border-info/30',
  high: 'bg-warning/15 text-warning border border-warning/30',
  urgent: 'bg-destructive/15 text-destructive border border-destructive/30',
};

export default function Tasks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: '' as Task['priority'] | '',
    dueDate: '',
    location: '',
  });

  const getTasksByStatus = (status: string) => 
    tasks.filter(t => {
      const matchesStatus = t.status === status;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = projectFilter === 'all' || t.project === mockProjects.find(p => p.id === projectFilter)?.name;
      return matchesStatus && matchesSearch && matchesProject;
    });

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
      )
    );
    toast.success('Task status updated');
  };

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success('Task deleted');
  };

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
      assignedToNames: ['Current User'],
      priority: formData.priority as Task['priority'],
      status: 'todo',
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      location: formData.location,
      tags: [],
    };

    setTasks(prev => [newTask, ...prev]);
    setFormData({ title: '', description: '', project: '', priority: '', dueDate: '', location: '' });
    setIsDialogOpen(false);
    toast.success('Task created successfully');
  };

  return (
    <MainLayout title="Task Management" subtitle="Plan, assign, and track field operation tasks">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <Input 
              placeholder="Search tasks..." 
              className="w-full sm:w-64" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {mockProjects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to your project</DialogDescription>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <SelectValue placeholder="Select priority" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto">
                    Create Task
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {statusColumns.map((column, colIndex) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIndex * 0.1 }}
            className="flex flex-col min-w-0"
          >
            <div className={cn('rounded-t-xl px-3 sm:px-4 py-2 sm:py-3', column.color)}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{column.label}</h3>
                <Badge variant="secondary" className="text-xs">{getTasksByStatus(column.id).length}</Badge>
              </div>
            </div>
            <div className="flex-1 space-y-2 sm:space-y-3 rounded-b-xl border border-t-0 bg-card/50 p-2 sm:p-3 min-h-[200px] sm:min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {getTasksByStatus(column.id).map((task, taskIndex) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: taskIndex * 0.05 }}
                    className="group rounded-lg border bg-card p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={cn('text-[10px] sm:text-xs px-2 py-0.5 rounded-full', priorityColors[task.priority])}>
                        {task.priority}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6">
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          {statusColumns.filter(s => s.id !== column.id).map(s => (
                            <DropdownMenuItem key={s.id} onClick={() => handleStatusChange(task.id, s.id)}>
                              Move to {s.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(task.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h4 className="font-medium text-foreground text-xs sm:text-sm mb-1 line-clamp-2">
                      {task.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">{task.project}</p>

                    <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                      {task.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-muted px-1.5 sm:px-2 py-0.5 rounded">
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex -space-x-1">
                        {task.assignedToNames.slice(0, 2).map((name, i) => (
                          <div
                            key={i}
                            className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-[8px] sm:text-[10px] font-medium text-primary"
                            title={name}
                          >
                            {name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {task.assignedToNames.length > 2 && (
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] sm:text-[10px] font-medium">
                            +{task.assignedToNames.length - 2}
                          </div>
                        )}
                      </div>
                    </div>

                    {task.location && (
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-2 pt-2 border-t">
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="truncate">{task.location}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </MainLayout>
  );
}
