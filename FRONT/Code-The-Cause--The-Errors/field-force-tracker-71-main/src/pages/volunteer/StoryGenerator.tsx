import { useState, useRef } from 'react';
import { VolunteerLayout } from '@/components/layout/VolunteerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, RefreshCw, Instagram, Twitter, Facebook, Linkedin, Check, Loader2, ImagePlus, X, Download, FileImage, FileText, Send, CheckCircle2, Clock, Share2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'from-sky-400 to-blue-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700' },
];

const tones = [
  { id: 'professional', name: 'Professional', emoji: '💼' },
  { id: 'casual', name: 'Casual & Friendly', emoji: '😊' },
  { id: 'inspirational', name: 'Inspirational', emoji: '✨' },
  { id: 'humorous', name: 'Humorous', emoji: '😄' },
  { id: 'urgent', name: 'Urgent/Call to Action', emoji: '🚨' },
];

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export default function StoryGenerator() {
  const [platform, setPlatform] = useState('instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('inspirational');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'submitted' | 'approved'>('pending');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyCardRef = useRef<HTMLDivElement>(null);

  const handleRequestApproval = async () => {
    setIsSubmittingApproval(true);
    try {
      // Get current user/worker id
      const profile = await apiClient.verifyAuth();
      const workerId = profile?.data?.id || profile?.id;
      if (!workerId) {
        toast.error('Unable to determine user. Please login again.');
        setIsSubmittingApproval(false);
        return;
      }

      // Instead of creating a leave request, create a story-request notification
      const payload = {
        workerId,
        type: 'GENERAL',
        payload: {
          category: 'STORY_REQUEST',
          story: generatedStory || 'Volunteer submitted a story for approval',
          platform,
          createdAt: new Date().toISOString(),
        },
      };

      await apiClient.createNotification(payload);
      setApprovalStatus('submitted');
      toast.success('Story request sent to NGO!', {
        description: 'Admin will review your story.'
      });
    } catch (err: any) {
      console.error('Approval request failed:', err);
      toast.error(err?.response?.data?.error || err?.message || 'Failed to send approval request');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(generatedStory);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(generatedStory)}`, '_blank');
    toast.success('Opening Facebook...');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(generatedStory);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    toast.success('Opening LinkedIn...');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct text sharing via URL, so we copy to clipboard
    navigator.clipboard.writeText(generatedStory);
    toast.success('Story copied! Open Instagram and paste in your post.', {
      description: 'Instagram doesn\'t support direct sharing.'
    });
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(generatedStory.substring(0, 280));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    toast.success('Opening Twitter/X...');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 4 - uploadedImages.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum 4 photos allowed');
      return;
    }

    const newImages: UploadedImage[] = [];
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setUploadedImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or activity to write about');
      return;
    }

    setIsGenerating(true);
    setGeneratedStory('');

    try {
      // Try remote function first
      let story = '';
      try {
        const resp = await supabase.functions.invoke('generate-story', {
          body: { platform, topic, tone, includeHashtags, includeEmoji },
        });
        if (resp?.data?.story) {
          story = resp.data.story;
        }
      } catch (fnErr) {
        // remote function failed — fall back to local generator
        console.warn('Supabase function error:', fnErr);
      }

      // Fallback local generator if remote failed or returned nothing
      if (!story) {
        const hashtags = includeHashtags ? '#community #volunteer' : '';
        const emoji = includeEmoji ? ' ✨' : '';
        story = `Today we ${topic.trim()}. We worked together to make an impact.${emoji} ${hashtags}`;
      }

      setGeneratedStory(story);
      toast.success('Story ready');
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedStory);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const exportAsImage = async () => {
    if (!storyCardRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(storyCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `volunteer-story-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Failed to export image');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!storyCardRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(storyCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`volunteer-story-${Date.now()}.pdf`);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedPlatform = platforms.find(p => p.id === platform);

  return (
    <VolunteerLayout title="Story Generator" subtitle="Create engaging social media content with AI">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Photo Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                Add Photos
              </CardTitle>
              <CardDescription>Upload up to 4 photos to include in your story (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {uploadedImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group"
                  >
                    <img
                      src={image.preview}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                
                {uploadedImages.length < 4 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-medium">Add Photo</span>
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {uploadedImages.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  {uploadedImages.length}/4 photos added
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Details</CardTitle>
              <CardDescription>Tell us what you want to share</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="topic">What did you do today?</Label>
                <Textarea
                  id="topic"
                  placeholder="E.g., Planted 50 trees at the community park with 20 volunteers, cleaned up the riverside, organized a recycling drive..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-2">
                          <span>{t.emoji}</span>
                          <span>{t.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="hashtags" className="cursor-pointer">Include Hashtags</Label>
                    <p className="text-xs text-muted-foreground mt-1">Add relevant hashtags</p>
                  </div>
                  <Switch
                    id="hashtags"
                    checked={includeHashtags}
                    onCheckedChange={setIncludeHashtags}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="emoji" className="cursor-pointer">Include Emojis</Label>
                    <p className="text-xs text-muted-foreground mt-1">Add personality with emojis</p>
                  </div>
                  <Switch
                    id="emoji"
                    checked={includeEmoji}
                    onCheckedChange={setIncludeEmoji}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full gap-2 h-12 text-base gradient-primary hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Story
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Story */}
        <AnimatePresence>
          {generatedStory && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {selectedPlatform && (
                        <div className={cn(
                          'p-2 rounded-lg bg-gradient-to-br',
                          selectedPlatform.color
                        )}>
                          <selectedPlatform.icon className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <CardTitle className="text-lg">Your Story</CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerate}
                        disabled={isGenerating}
                        className="gap-1"
                      >
                        <RefreshCw className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
                        <span className="hidden sm:inline">Regenerate</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCopy}
                        className="gap-1"
                        variant="outline"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Exportable Story Card */}
                <CardContent>
                  <div
                    ref={storyCardRef}
                    className="bg-white rounded-xl p-6 shadow-sm"
                    style={{ minHeight: '200px' }}
                  >
                    {/* Photo Grid */}
                    {uploadedImages.length > 0 && (
                      <div className={cn(
                        'grid gap-2 mb-4',
                        uploadedImages.length === 1 && 'grid-cols-1',
                        uploadedImages.length === 2 && 'grid-cols-2',
                        uploadedImages.length === 3 && 'grid-cols-2',
                        uploadedImages.length === 4 && 'grid-cols-2'
                      )}>
                        {uploadedImages.map((image, index) => (
                          <div
                            key={image.id}
                            className={cn(
                              'rounded-lg overflow-hidden',
                              uploadedImages.length === 3 && index === 0 && 'col-span-2'
                            )}
                          >
                            <img
                              src={image.preview}
                              alt={`Story photo ${index + 1}`}
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Story Text */}
                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
                      {generatedStory}
                    </p>
                    
                    {/* Branding Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedPlatform && (
                          <div className={cn(
                            'p-1.5 rounded-md bg-gradient-to-br',
                            selectedPlatform.color
                          )}>
                            <selectedPlatform.icon className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-xs text-gray-500">Created with Volunteer Story Generator</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* NGO Approval Section */}
                  <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        {approvalStatus === 'pending' && (
                          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        {approvalStatus === 'submitted' && (
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        {approvalStatus === 'approved' && (
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-foreground">NGO Approval</h4>
                          <p className="text-sm text-muted-foreground">
                            {approvalStatus === 'pending' && 'Get your story approved before sharing'}
                            {approvalStatus === 'submitted' && 'Waiting for NGO approval...'}
                            {approvalStatus === 'approved' && 'Approved! Ready to share'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleRequestApproval}
                        disabled={approvalStatus !== 'pending' || isSubmittingApproval}
                        className={cn(
                          'gap-2',
                          approvalStatus === 'approved' && 'bg-green-600 hover:bg-green-700'
                        )}
                        variant={approvalStatus === 'pending' ? 'default' : 'outline'}
                      >
                        {isSubmittingApproval ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : approvalStatus === 'pending' ? (
                          <>
                            <Send className="h-4 w-4" />
                            Request Approval
                          </>
                        ) : approvalStatus === 'submitted' ? (
                          <>
                            <Clock className="h-4 w-4" />
                            Pending Review
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Approved
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Social Sharing Section */}
                  <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Share2 className="h-5 w-5 text-primary" />
                      <h4 className="font-medium text-foreground">Share to Social Media</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareToWhatsApp}
                        className="gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareToInstagram}
                        className="gap-2 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border-pink-200 text-pink-700 dark:from-pink-900/20 dark:to-purple-900/20 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 dark:border-pink-800 dark:text-pink-400"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareToFacebook}
                        className="gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareToLinkedIn}
                        className="gap-2 bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:hover:bg-sky-900/30 dark:border-sky-800 dark:text-sky-400"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareToTwitter}
                        className="gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-900/20 dark:hover:bg-slate-900/30 dark:border-slate-800 dark:text-slate-400"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter/X
                      </Button>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex gap-3 mt-4 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportAsImage}
                      disabled={isExporting}
                      className="gap-2"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileImage className="h-4 w-4" />
                      )}
                      Download Image
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={exportAsPDF}
                      disabled={isExporting}
                      className="gap-2"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Pro Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Upload photos to make your story more engaging</li>
                    <li>• Be specific about what you did and the impact created</li>
                    <li>• Mention numbers (volunteers, trees planted, area cleaned)</li>
                    <li>• Download as PDF or image to share anywhere!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VolunteerLayout>
  );
}
