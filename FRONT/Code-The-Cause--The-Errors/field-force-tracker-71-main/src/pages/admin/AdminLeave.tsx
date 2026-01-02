import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import {
  Filter,
  Search,
  Check,
  X,
  Clock,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useState } from "react";

interface LeaveRequest {
  id: string;
  workerId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
}

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-warning/20 text-warning" },
  APPROVED: { label: "Approved", className: "bg-success/20 text-success" },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/20 text-destructive",
  },
};

export default function AdminLeave() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch leave requests
  const { data: leaveData, isLoading } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: async () => {
      const response = await apiClient.getLeaveRequests();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Fetch workers for names
  const { data: workersData } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const response = await apiClient.getWorkers();
      return response.data?.data ?? response.data ?? [];
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.approveLeaveRequest(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success("Leave request approved");
    },
    onError: () => {
      toast.error("Failed to approve leave request");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.rejectLeaveRequest(
        id,
        "Rejected by admin"
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success("Leave request rejected");
    },
    onError: () => {
      toast.error("Failed to reject leave request");
    },
  });

  const leaveRequests: LeaveRequest[] = leaveData || [];
  const workers = workersData || [];

  const getWorkerName = (workerId: string) => {
    const worker = workers.find((w: any) => w.id === workerId);
    return worker ? `${worker.firstname} ${worker.lastname}` : "Unknown";
  };

  const getWorkerInitials = (workerId: string) => {
    const worker = workers.find((w: any) => w.id === workerId);
    if (!worker) return "??";
    return `${worker.firstname?.[0] || ""}${worker.lastname?.[0] || ""}`;
  };

  const getDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredRequests = leaveRequests.filter((req) => {
    const workerName = getWorkerName(req.workerId).toLowerCase();
    return workerName.includes(searchQuery.toLowerCase());
  });

  const pendingCount = leaveRequests.filter(
    (r) => r.status === "PENDING"
  ).length;
  const approvedCount = leaveRequests.filter(
    (r) => r.status === "APPROVED"
  ).length;
  const rejectedCount = leaveRequests.filter(
    (r) => r.status === "REJECTED"
  ).length;

  if (isLoading) {
    return (
      <AdminLayout title="Leave Management" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Leave Management"
      subtitle="Review and manage leave requests"
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
              placeholder="Search requests..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary" className="bg-warning/20 text-warning">
          {pendingCount} Pending Approval
        </Badge>
      </motion.div>

      {/* Leave Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
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
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {approvedCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Approved
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
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {rejectedCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Rejected
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Leave Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leave requests found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredRequests.map((request) => {
                  const status =
                    statusConfig[request.status as keyof typeof statusConfig] ||
                    statusConfig.PENDING;
                  const initials = getWorkerInitials(request.workerId);
                  const workerName = getWorkerName(request.workerId);
                  const days = getDays(request.startDate, request.endDate);

                  return (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">
                              {workerName}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {request.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(request.startDate).toLocaleDateString()}{" "}
                              - {new Date(request.endDate).toLocaleDateString()}{" "}
                              ({days}d)
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                            {request.reason || "No reason provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 pl-12 sm:pl-0">
                        <Badge
                          variant="secondary"
                          className={cn(status.className, "shrink-0")}
                        >
                          {status.label}
                        </Badge>
                        {request.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-success border-success hover:bg-success/10"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => rejectMutation.mutate(request.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
