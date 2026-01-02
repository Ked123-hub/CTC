import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  MapPin,
  Plus,
  Users,
  Activity,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  startDate: string;
  endDate?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export default function AdminLocations() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    latitude: "",
    longitude: "",
    radius: "100",
  });

  // Fetch projects (locations)
  const { data: projectsData, isLoading } = useQuery({
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

  const projects: Project[] = projectsData || [];
  const activeWorkers = activeWorkersData || [];

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.createProject(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Location created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create location");
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.updateProject(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Location updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update location");
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteProject(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Location deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete location");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      description: "",
      latitude: "",
      longitude: "",
      radius: "100",
    });
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      name: formData.name,
      location: formData.location,
      description: formData.description,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude
        ? parseFloat(formData.longitude)
        : undefined,
      radius: formData.radius ? parseInt(formData.radius) : 100,
      status: "ACTIVE",
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: projectData });
    } else {
      createMutation.mutate(projectData);
    }
  };

  const handleDelete = (projectId: string) => {
    deleteMutation.mutate(projectId);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "completed":
        return "bg-blue-500/10 text-blue-500";
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getActiveCount = (projectId: string) => {
    return activeWorkers.filter((w: any) => w.projectId === projectId).length;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Manage Locations" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Locations"
      subtitle="Create and manage project locations with geofencing"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Locations
                  </p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
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
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Locations
                  </p>
                  <p className="text-2xl font-bold">
                    {projects.filter((p) => p.status === "ACTIVE").length}
                  </p>
                </div>
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
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Workers On-Site
                  </p>
                  <p className="text-2xl font-bold">{activeWorkers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Locations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project Locations</CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? "Edit Location" : "Create New Location"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Downtown Office"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Address</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="123 Main St, City"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
                        placeholder="12.9716"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
                        placeholder="77.5946"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius">Geofence Radius (meters)</Label>
                    <Input
                      id="radius"
                      type="number"
                      value={formData.radius}
                      onChange={(e) =>
                        setFormData({ ...formData, radius: e.target.value })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProject ? "Update" : "Create"} Location
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No locations found</p>
                <p className="text-sm">
                  Create your first location to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Workers</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {project.name}
                        </div>
                      </TableCell>
                      <TableCell>{project.location || "—"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {getActiveCount(project.id)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingProject(project);
                              setFormData({
                                name: project.name,
                                location: project.location || "",
                                description: project.description || "",
                                latitude: project.latitude?.toString() || "",
                                longitude: project.longitude?.toString() || "",
                                radius: project.radius?.toString() || "100",
                              });
                              setIsCreateOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(project.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
