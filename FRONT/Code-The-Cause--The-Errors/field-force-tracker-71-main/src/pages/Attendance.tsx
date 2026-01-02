import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockAttendance, mockStaff } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Clock, MapPin, Search, Download, Calendar, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceMap } from '@/components/dashboard/AttendanceMap';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusConfig = {
  present: { label: 'Present', variant: 'success' as const, icon: CheckCircle },
  late: { label: 'Late', variant: 'warning' as const, icon: AlertCircle },
  absent: { label: 'Absent', variant: 'destructive' as const, icon: XCircle },
  'half-day': { label: 'Half Day', variant: 'info' as const, icon: Clock },
};

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const filteredAttendance = mockAttendance.filter((record) => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Attendance" subtitle="Track and manage staff attendance with location tagging">
      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="half-day">Half Day</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present', count: 4, variant: 'success' },
          { label: 'Late', count: 1, variant: 'warning' },
          { label: 'Absent', count: 1, variant: 'destructive' },
          { label: 'On Leave', count: 1, variant: 'info' },
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
              item.variant === 'destructive' && 'bg-destructive/10 border-destructive/20',
              item.variant === 'info' && 'bg-info/10 border-info/20'
            )}
          >
            <p className="text-2xl font-bold text-foreground">{item.count}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <AttendanceMap 
          selectedStaffId={selectedStaffId} 
          onStaffSelect={setSelectedStaffId} 
        />
      </motion.div>

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card shadow-sm overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Staff Member</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.map((record, index) => {
              const status = statusConfig[record.status];
              const StatusIcon = status.icon;
              const isSelected = selectedStaffId === record.id;
              return (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={cn(
                    "hover:bg-muted/30 transition-colors cursor-pointer",
                    isSelected && "bg-primary/10 hover:bg-primary/15"
                  )}
                  onClick={() => setSelectedStaffId(isSelected ? null : record.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {record.staffName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{record.staffName}</p>
                        <p className="text-xs text-muted-foreground">{record.date}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-success" />
                      {record.checkIn}
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.checkOut ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {record.checkOut}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm max-w-[200px]">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{record.location.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {record.workHours ? `${record.workHours}h` : '--'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>
    </MainLayout>
  );
}
