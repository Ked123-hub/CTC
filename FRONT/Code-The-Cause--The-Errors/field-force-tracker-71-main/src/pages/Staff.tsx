import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockStaff } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Plus, Search, Mail, Phone, Calendar, MoreHorizontal, Edit2, UserX, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Staff as StaffType } from '@/types';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { toast } from 'sonner';

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  'on-leave': { label: 'On Leave', variant: 'warning' as const },
  inactive: { label: 'Inactive', variant: 'pending' as const },
};

const departments = ['All Departments', 'Waste Collection', 'Recycling', 'Awareness Drives', 'Operations'];

export default function Staff() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffType[]>(mockStaff);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    joinDate: '',
    role: '',
    department: '',
  });

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'All Departments' || staff.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleStatusToggle = (staffId: string) => {
    setStaffList(prev =>
      prev.map(s =>
        s.id === staffId
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
    toast.success('Staff status updated');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newStaff: StaffType = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setStaffList(prev => [newStaff, ...prev]);
    setFormData({ name: '', email: '', phone: '', joinDate: '', role: '', department: '' });
    setIsDialogOpen(false);
    toast.success('Staff member added successfully');
  };

  const activeCount = staffList.filter(s => s.status === 'active').length;
  const onLeaveCount = staffList.filter(s => s.status === 'on-leave').length;

  return (
    <MainLayout title="Staff Directory" subtitle="Manage your field operations team">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>Add a new team member to your organization</DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input 
                      placeholder="Enter name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone *</label>
                    <Input 
                      placeholder="+91 98765 43210" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Join Date</label>
                    <Input 
                      type="date" 
                      value={formData.joinDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role *</label>
                    <Input 
                      placeholder="e.g. Field Officer" 
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department *</label>
                    <Select value={formData.department} onValueChange={(val) => setFormData(prev => ({ ...prev, department: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.slice(1).map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto">
                    Add Staff
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
          { label: 'Total Staff', count: staffList.length, variant: 'default' },
          { label: 'Active', count: activeCount, variant: 'success' },
          { label: 'On Leave', count: onLeaveCount, variant: 'warning' },
          { label: 'Departments', count: 4, variant: 'info' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-xl border p-3 sm:p-4 text-center',
              item.variant === 'default' && 'bg-card',
              item.variant === 'success' && 'bg-success/10 border-success/20',
              item.variant === 'warning' && 'bg-warning/10 border-warning/20',
              item.variant === 'info' && 'bg-info/10 border-info/20'
            )}
          >
            <p className="text-xl sm:text-2xl font-bold text-foreground">{item.count}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredStaff.map((staff, index) => {
          const status = statusConfig[staff.status];
          return (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all hover:border-primary/20 group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-sm sm:text-lg">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-card',
                          staff.status === 'active' && 'bg-success',
                          staff.status === 'on-leave' && 'bg-warning',
                          staff.status === 'inactive' && 'bg-muted'
                        )} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{staff.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{staff.role}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" /> View Attendance
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {staff.status === 'active' ? (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleStatusToggle(staff.id)}>
                            <UserX className="h-4 w-4 mr-2" /> Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success" onClick={() => handleStatusToggle(staff.id)}>
                            <UserCheck className="h-4 w-4 mr-2" /> Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                      {staff.phone}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Department</p>
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{staff.department}</p>
                    </div>
                    <Badge variant={status.variant} className="text-[10px] sm:text-xs shrink-0">{status.label}</Badge>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    Joined {new Date(staff.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </MainLayout>
  );
}
