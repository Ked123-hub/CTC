import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pencil,
  UserPlus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId?: string;
  assignedTo?: string;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Circle,
    className: "text-muted-foreground",
  },
  IN_PROGRESS: { label: "In Progress", icon: Clock, className: "text-info" },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-success",
  },
};

const priorityConfig = {
  HIGH: { label: "High", className: "bg-destructive/20 text-destructive" },
  MEDIUM: { label: "Medium", className: "bg-warning/20 text-warning" },
  LOW: { label: "Low", className: "bg-muted text-muted-foreground" },
};

export default function AdminTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "BACKLOG",
    assignedTo: "",
    dueDate: "",
    projectId: "",
  });

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await apiClient.getTasks();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.getProjects();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Fetch workers for assignee names
  const { data: workersData } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const response = await apiClient.getWorkers();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.updateTask(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.createTask(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Task Created",
        description: "New task has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Assign task mutation
  const assignMutation = useMutation({
    mutationFn: async (data: { taskId: string; workerId: string }) => {
      const response = await apiClient.assignTask(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setReassignDialogOpen(false);
      toast({
        title: "Task Reassigned",
        description: "Task has been reassigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reassign task",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteTask(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task Deleted",
        description: "Task has been removed",
        variant: "destructive",
      });
    },
  });

  const tasks: Task[] = tasksData || [];
  const workers = workersData || [];
  const projects = projectsData || [];
  const [searchParams] = useSearchParams();

  const getWorkerName = (workerId?: string) => {
    if (!workerId) return "Unassigned";
    const worker = workers.find((w: any) => w.id === workerId);
    return worker ? `${worker.firstname} ${worker.lastname}` : "Unknown";
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "BACKLOG",
      assignedTo: "",
      dueDate: "",
      projectId: "",
    });
    setSelectedTask(null);
  };

  const handleCreateTask = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      projectId: formData.projectId,
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      status: formData.status,
    });
  };

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      handleCreateTask();
    }
  }, [searchParams]);

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      updateMutation.mutate(
        {
          id: selectedTask.id,
          data: {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            dueDate: formData.dueDate || undefined,
          },
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            resetForm();
            toast({
              title: "Task Updated",
              description: "Task has been updated successfully",
            });
          },
        }
      );
    }
  };

  const handleReassignSubmit = () => {
    if (selectedTask && formData.assignedTo) {
      assignMutation.mutate({
        taskId: selectedTask.id,
        workerId: formData.assignedTo,
      });
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate || "",
      projectId: task.projectId || "",
    });
    setEditDialogOpen(true);
  };

  const handleReassign = (task: Task) => {
    setSelectedTask(task);
    setFormData((prev) => ({ ...prev, assignedTo: task.assignedTo || "" }));
    setReassignDialogOpen(true);
  };

  const handleMarkComplete = (task: Task) => {
    updateMutation.mutate(
      { id: task.id, data: { status: "COMPLETED" } },
      {
        onSuccess: () => {
          toast({
            title: "Task Completed",
            description: `"${task.title}" has been marked as complete`,
          });
        },
      }
    );
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id);
    }
    setDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Task Management" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Task Management"
      subtitle="Assign and track tasks for your team"
    >
      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6"
      >
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Assign New Task
        </Button>
      </motion.div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center">
                <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {pendingCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pending
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-info/20 flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {inProgressCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  In Progress
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {completedCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Completed
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTasks.map((task) => {
                  const status =
                    statusConfig[task.status as keyof typeof statusConfig] ||
                    statusConfig.PENDING;
                  const priority =
                    priorityConfig[
                      task.priority as keyof typeof priorityConfig
                    ] || priorityConfig.MEDIUM;
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <StatusIcon
                          className={cn(
                            "h-5 w-5 shrink-0 mt-0.5 sm:mt-0",
                            status.className
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground line-clamp-2 sm:truncate">
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {getWorkerName(task.assignedTo)}
                              </span>
                            </div>
                            <span className="text-muted-foreground hidden sm:inline">
                              •
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "No due date"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0">
                        <Badge
                          variant="secondary"
                          className={priority.className}
                        >
                          {priority.label}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEditTask(task)}
                              className="gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReassign(task)}
                              className="gap-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              Reassign
                            </DropdownMenuItem>
                            {task.status !== "COMPLETED" && (
                              <DropdownMenuItem
                                onClick={() => handleMarkComplete(task)}
                                className="gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task)}
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new task
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Task description"
              />
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData({ ...formData, projectId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker: any) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.firstname} {worker.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the task details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reassign Task Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>
              Reassign "{selectedTask?.title}" to another team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker: any) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.firstname} {worker.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReassignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReassignSubmit}
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? "Reassigning..." : "Reassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
