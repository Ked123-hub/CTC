import { AdminLayout } from '@/components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, MoreHorizontal, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
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
import { Label } from '@/components/ui/label';

const initialMockStaff = [
  { id: 1, name: 'Priya Sharma', role: 'Field Officer', department: 'Waste Collection', email: 'priya@ecoforce.com', phone: '+91 98765 43210', zone: 'Zone A', status: 'active' },
  { id: 2, name: 'Amit Verma', role: 'Team Lead', department: 'Recycling', email: 'amit@ecoforce.com', phone: '+91 98765 43211', zone: 'Zone B', status: 'active' },
  { id: 3, name: 'Rahul Patel', role: 'Field Officer', department: 'Awareness', email: 'rahul@ecoforce.com', phone: '+91 98765 43212', zone: 'Zone A', status: 'on-leave' },
  { id: 4, name: 'Sunita Devi', role: 'Field Officer', department: 'Waste Collection', email: 'sunita@ecoforce.com', phone: '+91 98765 43213', zone: 'Zone C', status: 'active' },
  { id: 5, name: 'Vikram Singh', role: 'Supervisor', department: 'Operations', email: 'vikram@ecoforce.com', phone: '+91 98765 43214', zone: 'All Zones', status: 'active' },
];

const statusConfig = {
  'active': { label: 'Active', className: 'bg-success/20 text-success' },
  'on-leave': { label: 'On Leave', className: 'bg-warning/20 text-warning' },
  'inactive': { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
};

const departments = ['Waste Collection', 'Recycling', 'Awareness', 'Operations'];
const roles = ['Field Officer', 'Team Lead', 'Supervisor', 'Coordinator'];
const zones = ['Zone A', 'Zone B', 'Zone C', 'All Zones'];

export default function AdminStaff() {
  const location = useLocation();
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState(initialMockStaff);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    zone: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const newStaff = {
      id: staffList.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'N/A',
      role: formData.role,
      department: formData.department,
      zone: formData.zone || 'Unassigned',
      status: 'active',
    };
    setStaffList([newStaff, ...staffList]);
    setFormData({ name: '', email: '', phone: '', role: '', department: '', zone: '' });
    setIsDialogOpen(false);
    toast({ title: 'Staff member added successfully' });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'add') {
      setIsDialogOpen(true);
    }
  }, [location.search]);

  return (
    <AdminLayout title="Staff Directory" subtitle="Manage your team members">
      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6"
      >
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search staff..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name *</Label>
                <Input
                  id="staff-name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email *</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-phone">Phone</Label>
                  <Input
                    id="staff-phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assigned Zone</Label>
                <Select value={formData.zone} onValueChange={(value) => setFormData({ ...formData, zone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Staff Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{staffList.length}</p>
              <p className="text-sm text-muted-foreground">Total Staff</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{staffList.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-warning">{staffList.filter(s => s.status === 'on-leave').length}</p>
              <p className="text-sm text-muted-foreground">On Leave</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Staff Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {staffList.map((staff) => {
          const status = statusConfig[staff.status as keyof typeof statusConfig];
          const initials = staff.name.split(' ').map(n => n[0]).join('');
          
          return (
            <Card key={staff.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Assign Task</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">{staff.department}</Badge>
                  <Badge variant="secondary" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{staff.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{staff.zone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>
    </AdminLayout>
  );
}
