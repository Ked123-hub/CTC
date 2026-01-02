import { useState } from 'react';
import { VolunteerLayout } from '@/components/layout/VolunteerLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveRequest } from '@/types';
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
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useEffect } from 'react';

const leaveTypeConfig = {
  annual: { label: 'Annual Leave', color: 'bg-info/15 text-info border-info/30' },
  sick: { label: 'Sick Leave', color: 'bg-destructive/15 text-destructive border-destructive/30' },
  personal: { label: 'Personal', color: 'bg-warning/15 text-warning border-warning/30' },
  emergency: { label: 'Emergency', color: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const statusConfig = {
  pending: { label: 'Pending', variant: 'pending' as const },
  approved: { label: 'Approved', variant: 'success' as const },
  rejected: { label: 'Rejected', variant: 'destructive' as const },
};

export default function VolunteerLeave() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [workerId, setWorkerId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: '' as LeaveRequest['type'] | '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleSubmit = async () => {
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!workerId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const payload = {
        workerId,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      };
      const resp = await apiClient.createLeaveRequest(payload);
      const created = resp.data || resp;
      setLeaveRequests(prev => [created, ...prev]);
      setFormData({ type: '', startDate: '', endDate: '', reason: '' });
      setIsDialogOpen(false);
      toast.success('Leave request submitted!', {
        description: 'Your request has been sent for approval.',
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || 'Failed to submit leave');
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await apiClient.verifyAuth();
        const id = profile.data?.id || profile.id;
        if (mounted && id) {
          setWorkerId(id);
          const leavesResp = await apiClient.getLeaveRequests({ workerId: id });
          // normalize response shapes: { data: [...] } or { data: { data: [...] } }
          const leaves =
            leavesResp?.data?.data ?? leavesResp?.data ?? leavesResp;
          setLeaveRequests(Array.isArray(leaves) ? leaves : []);
        }
      } catch (e) {
        // not authenticated or no leaves
      }
    })();
    return () => { mounted = false };
  }, []);

  // Normalize statuses (server returns uppercase enums)
  const pendingCount = leaveRequests.filter(
    (r) => (r.status || "").toString().toUpperCase() === "PENDING"
  ).length;
  const approvedCount = leaveRequests.filter(
    (r) => (r.status || "").toString().toUpperCase() === "APPROVED"
  ).length;

  return (
    <VolunteerLayout title="Leave Request" subtitle="Submit and track your leave requests">
      <div className="space-y-6">
        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription>Submit a new leave request for approval</DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Leave Type</label>
                  <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({ ...prev, type: val as LeaveRequest['type'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea 
                    placeholder="Provide a reason for your leave request..." 
                    rows={3} 
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit}>
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Pending', count: pendingCount, variant: 'warning' },
            { label: 'Approved', count: approvedCount, variant: 'success' },
            { label: 'Available Days', count: 12, variant: 'info' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'rounded-xl border p-4 text-center',
                item.variant === 'success' && 'bg-success/10 border-success/20',
                item.variant === 'warning' && 'bg-warning/10 border-warning/20',
                item.variant === 'info' && 'bg-info/10 border-info/20'
              )}
            >
              <p className="text-2xl font-bold text-foreground">{item.count}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Leave Requests List */}
        {leaveRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "New Request" to submit your first leave request
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {leaveRequests.map((request, index) => {
                const typeKey = (request.type || "").toString().toLowerCase();
                const leaveType = leaveTypeConfig[typeKey] || leaveTypeConfig.annual;
                const statusKey = (request.status || "").toString().toLowerCase();
                const status = statusConfig[statusKey] || statusConfig.pending;
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={cn('px-2 py-0.5 rounded-full text-xs border', leaveType.color)}>
                                {leaveType.label}
                              </span>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {days} day{days > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {request.reason}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Applied: {new Date(request.appliedOn || request.createdAt || request.created_at).toLocaleDateString()}
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
