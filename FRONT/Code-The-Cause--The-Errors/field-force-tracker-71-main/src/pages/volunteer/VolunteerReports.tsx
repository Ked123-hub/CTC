import { useState, useRef } from 'react';
import { VolunteerLayout } from '@/components/layout/VolunteerLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, MapPin, Camera, Calendar, ImagePlus, X } from 'lucide-react';
import { DailyReport } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

export default function VolunteerReports() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    tasksSummary: '',
    challenges: '',
    achievements: '',
    location: '',
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
    if (!formData.tasksSummary || !formData.location) {
      toast.error('Please fill in required fields');
      return;
    }

    const newReport: DailyReport = {
      id: Date.now().toString(),
      staffId: 'volunteer-user',
      staffName: 'Volunteer User',
      date: new Date().toISOString().split('T')[0],
      tasksSummary: formData.tasksSummary,
      challenges: formData.challenges,
      achievements: formData.achievements,
      location: formData.location,
      photosCount: uploadedPhotos.length,
      submittedAt: new Date().toISOString(),
    };

    // Clean up photo previews
    uploadedPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));

    setReports(prev => [newReport, ...prev]);
    setFormData({ tasksSummary: '', challenges: '', achievements: '', location: '' });
    setUploadedPhotos([]);
    setIsDialogOpen(false);
    toast.success('Daily report submitted!');
  };

  const today = new Date().toISOString().split('T')[0];
  const hasSubmittedToday = reports.some(r => r.date === today);

  return (
    <VolunteerLayout title="Daily Reports" subtitle="Submit your daily activity reports">
      <div className="space-y-6">
        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            {hasSubmittedToday ? (
              <Badge variant="success" className="gap-1">
                <FileText className="h-3 w-3" />
                Today's report submitted
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <FileText className="h-3 w-3" />
                Report pending for today
              </Badge>
            )}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={hasSubmittedToday}>
                <Plus className="h-4 w-4" />
                Submit Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Daily Report</DialogTitle>
                <DialogDescription>
                  Submit your daily activity report for {new Date().toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tasks Summary *</label>
                  <Textarea 
                    placeholder="Summarize the tasks you completed today..." 
                    rows={3} 
                    value={formData.tasksSummary}
                    onChange={(e) => setFormData(prev => ({ ...prev, tasksSummary: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Achievements</label>
                  <Textarea 
                    placeholder="Any notable achievements or milestones..." 
                    rows={2} 
                    value={formData.achievements}
                    onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Challenges</label>
                  <Textarea 
                    placeholder="Any challenges or blockers faced..." 
                    rows={2} 
                    value={formData.challenges}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input 
                    placeholder="Work location" 
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Photo Upload Section */}
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
                      className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 hover:border-primary transition-colors cursor-pointer"
                    >
                      <ImagePlus className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Click to upload photos
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
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
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit}>
                    Submit Report
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reports submitted yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Submit your first daily report to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {new Date(report.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Tasks Summary</p>
                            <p className="text-sm text-foreground">{report.tasksSummary}</p>
                          </div>
                          
                          {report.achievements && (
                            <div>
                              <p className="text-xs font-medium text-success mb-1">Achievements</p>
                              <p className="text-sm text-foreground">{report.achievements}</p>
                            </div>
                          )}
                          
                          {report.challenges && (
                            <div>
                              <p className="text-xs font-medium text-warning mb-1">Challenges</p>
                              <p className="text-sm text-foreground">{report.challenges}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {report.location}
                          </span>
                          {report.photosCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Camera className="h-3.5 w-3.5" />
                              {report.photosCount} photo{report.photosCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </VolunteerLayout>
  );
}
