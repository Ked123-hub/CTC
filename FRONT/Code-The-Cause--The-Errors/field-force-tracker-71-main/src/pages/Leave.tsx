import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockLeaveRequests } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Check, X, Clock } from 'lucide-react';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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

export default function Leave() {
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const leaves = await apiClient.getLeaveRequests();
        if (mounted) setLeaveRequests(leaves.data || leaves);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    type: '' as LeaveRequest['type'] | '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const filteredRequests = leaveRequests.filter((request) => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const handleApprove = async (id: string) => {
    try {
      await apiClient.approveLeaveRequest(id);
      setLeaveRequests(prev =>
        prev.map(req =>
          req.id === id
            ? { ...req, status: 'approved' as const, reviewedBy: 'Admin', reviewedOn: new Date().toISOString().split('T')[0] }
            : req
        )
      );
      toast.success('Leave request approved');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.rejectLeaveRequest(id, 'Rejected by admin');
      setLeaveRequests(prev =>
        prev.map(req =>
          req.id === id
            ? { ...req, status: 'rejected' as const, reviewedBy: 'Admin', reviewedOn: new Date().toISOString().split('T')[0] }
            : req
        )
      );
      toast.error('Leave request rejected');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to reject');
    }
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      staffId: 'current-user',
      staffName: 'Current User',
      type: formData.type as LeaveRequest['type'],
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests(prev => [newRequest, ...prev]);
    setFormData({ type: '', startDate: '', endDate: '', reason: '' });
    setIsDialogOpen(false);
    toast.success('Leave request submitted');
  };

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length;

  return (
    <MainLayout title="Leave Management" subtitle="Manage staff leave requests and approvals">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto text-xs sm:text-sm">
              <TabsTrigger value="all" className="px-2 sm:px-4">All</TabsTrigger>
              <TabsTrigger value="pending" className="px-2 sm:px-4">
                <span className="hidden sm:inline">Pending</span>
                <span className="sm:hidden">Pend</span>
                <Badge variant="secondary" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 justify-center text-[10px] sm:text-xs">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="px-2 sm:px-4">
                <span className="hidden sm:inline">Approved</span>
                <span className="sm:hidden">Appr</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="px-2 sm:px-4">
                <span className="hidden sm:inline">Rejected</span>
                <span className="sm:hidden">Rej</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto">
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Pending', count: pendingCount, variant: 'warning' },
          { label: 'Approved', count: approvedCount, variant: 'success' },
          { label: 'Rejected', count: rejectedCount, variant: 'destructive' },
          { label: 'Available Days', count: 12, variant: 'info' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-xl border p-3 sm:p-4 text-center',
              item.variant === 'success' && 'bg-success/10 border-success/20',
              item.variant === 'warning' && 'bg-warning/10 border-warning/20',
              item.variant === 'destructive' && 'bg-destructive/10 border-destructive/20',
              item.variant === 'info' && 'bg-info/10 border-info/20'
            )}
          >
            <p className="text-xl sm:text-2xl font-bold text-foreground">{item.count}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Leave Requests List */}
      <div className="space-y-3 sm:space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((request, index) => {
            const leaveType = leaveTypeConfig[request.type];
            const status = statusConfig[request.status];
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
                className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm sm:text-base shrink-0">
                      {request.staffName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground text-sm sm:text-base">{request.staffName}</h4>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] sm:text-xs border', leaveType.color)}>
                          {leaveType.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="hidden sm:inline">{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
                          <span className="sm:hidden">{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {days}d
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{request.reason}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {request.status === 'pending' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          className="gap-1 flex-1 sm:flex-none"
                          onClick={() => handleApprove(request.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                      </div>
                    )}

                    {request.status !== 'pending' && request.reviewedBy && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        <p>Reviewed by {request.reviewedBy}</p>
                        <p className="text-[10px] sm:text-xs">{request.reviewedOn}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
