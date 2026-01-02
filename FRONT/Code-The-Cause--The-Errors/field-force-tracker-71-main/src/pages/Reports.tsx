import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockReports, mockStaff } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Plus, FileText, MapPin, Image, Clock, Calendar, Send, Download, X, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailyReport } from '@/types';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

export default function Reports() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffFilter, setStaffFilter] = useState('all');
  const [reports, setReports] = useState<DailyReport[]>(mockReports);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: selectedDate,
    location: '',
    tasksSummary: '',
    achievements: '',
    challenges: '',
  });

  const filteredReports = reports.filter(r => {
    const matchesStaff = staffFilter === 'all' || r.staffId === staffFilter;
    return matchesStaff;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 6 - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum 6 photos allowed per report');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: UploadedPhoto[] = [];

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }
      newPhotos.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = () => {
    if (!formData.location || !formData.tasksSummary) {
      toast.error('Please fill in required fields');
      return;
    }

    const newReport: DailyReport = {
      id: Date.now().toString(),
      staffId: 'current-user',
      staffName: 'Current User',
      date: formData.date,
      tasksSummary: formData.tasksSummary,
      challenges: formData.challenges,
      achievements: formData.achievements,
      location: formData.location,
      photosCount: uploadedPhotos.length,
      photos: uploadedPhotos.map(p => p.preview),
      submittedAt: new Date().toISOString(),
    };

    setReports(prev => [newReport, ...prev]);
    setFormData({ date: selectedDate, location: '', tasksSummary: '', achievements: '', challenges: '' });
    
    // Clean up photo previews
    uploadedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setUploadedPhotos([]);
    
    setIsDialogOpen(false);
    toast.success(`Report submitted with ${newReport.photosCount} photo${newReport.photosCount !== 1 ? 's' : ''}`);
  };

  const reportsToday = reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length;
  const totalPhotos = reports.reduce((acc, r) => acc + r.photosCount, 0);

  return (
    <MainLayout title="Daily Reports" subtitle="Submit and review daily field operation reports">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-40"
            />
            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {mockStaff.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Reports</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Submit Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Daily Report</DialogTitle>
                  <DialogDescription>Document your field activities for today</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date *</label>
                      <Input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location *</label>
                      <Input 
                        placeholder="Enter location" 
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tasks Summary *</label>
                    <Textarea
                      placeholder="Describe the tasks you completed today..."
                      rows={4}
                      value={formData.tasksSummary}
                      onChange={(e) => setFormData(prev => ({ ...prev, tasksSummary: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Achievements</label>
                      <Textarea
                        placeholder="Notable achievements..."
                        rows={3}
                        value={formData.achievements}
                        onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Challenges</label>
                      <Textarea
                        placeholder="Any challenges faced..."
                        rows={3}
                        value={formData.challenges}
                        onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photos (up to 6)</label>
                    
                    {/* Photo Previews */}
                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {uploadedPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-border group"
                          >
                            <img
                              src={photo.preview}
                              alt="Upload preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Area */}
                    {uploadedPhotos.length < 6 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center hover:bg-muted/50 hover:border-primary transition-colors cursor-pointer"
                      >
                        <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Drop images here or click to upload
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 10MB each • {uploadedPhotos.length}/6 photos
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                      Save Draft
                    </Button>
                    <Button
                      type="button"
                      className="gap-2 w-full sm:w-auto"
                      onClick={handleSubmit}
                    >
                      <Send className="h-4 w-4" />
                      Submit Report
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Reports Today', count: reportsToday, icon: FileText, variant: 'primary' },
          { label: 'Pending Review', count: 1, icon: Clock, variant: 'warning' },
          { label: 'Total Photos', count: totalPhotos, icon: Image, variant: 'info' },
          { label: 'Active Zones', count: 4, icon: MapPin, variant: 'success' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-xl border p-3 sm:p-4 flex items-center gap-3 sm:gap-4',
              item.variant === 'primary' && 'bg-primary/10 border-primary/20',
              item.variant === 'success' && 'bg-success/10 border-success/20',
              item.variant === 'warning' && 'bg-warning/10 border-warning/20',
              item.variant === 'info' && 'bg-info/10 border-info/20'
            )}
          >
            <div className={cn(
              'h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0',
              item.variant === 'primary' && 'bg-primary/20 text-primary',
              item.variant === 'success' && 'bg-success/20 text-success',
              item.variant === 'warning' && 'bg-warning/20 text-warning',
              item.variant === 'info' && 'bg-info/20 text-info'
            )}>
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{item.count}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm shrink-0">
                      {report.staffName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base truncate">{report.staffName}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {new Date(report.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {new Date(report.submittedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] sm:text-xs shrink-0">Submitted</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                  <span className="truncate">{report.location}</span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1">Tasks Summary</h4>
                    <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2">{report.tasksSummary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="rounded-lg bg-success/10 p-2 sm:p-3">
                      <h4 className="text-[10px] sm:text-xs font-medium text-success mb-1">Achievements</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{report.achievements}</p>
                    </div>
                    <div className="rounded-lg bg-warning/10 p-2 sm:p-3">
                      <h4 className="text-[10px] sm:text-xs font-medium text-warning mb-1">Challenges</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{report.challenges}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                      {report.photosCount} photos
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 sm:h-8"
                      onClick={() => setSelectedReport(report)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {selectedReport.staffName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <DialogTitle>{selectedReport.staffName}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedReport.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      {new Date(selectedReport.submittedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{selectedReport.location}</span>
                </div>

                {/* Tasks Summary */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Tasks Summary</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.tasksSummary}</p>
                </div>

                {/* Achievements & Challenges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-success/10 p-4">
                    <h4 className="text-sm font-medium text-success mb-2">Achievements</h4>
                    <p className="text-sm text-muted-foreground">{selectedReport.achievements}</p>
                  </div>
                  <div className="rounded-lg bg-warning/10 p-4">
                    <h4 className="text-sm font-medium text-warning mb-2">Challenges</h4>
                    <p className="text-sm text-muted-foreground">{selectedReport.challenges}</p>
                  </div>
                </div>

                {/* Photos */}
                {selectedReport.photos && selectedReport.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Photos ({selectedReport.photos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedReport.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative aspect-video rounded-lg overflow-hidden border border-border group cursor-pointer"
                          onClick={() => window.open(photo, '_blank')}
                        >
                          <img
                            src={photo}
                            alt={`Report photo ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No photos message */}
                {(!selectedReport.photos || selectedReport.photos.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No photos attached to this report</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
