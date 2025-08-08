import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Profile from './Profile';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Briefcase, 
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
}

function EnhancedResumeBuilder() {
  const [resumeText, setResumeText] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    skills: '',
    experience: '',
    education: ''
  });
  const { toast } = useToast();

  // Handle profile updates
  const handleProfileUpdate = async (profile: ProfileData) => {
    setProfileData(profile);

    const resumeContent = `
Name: ${profile.fullName}
Email: ${profile.email}
Phone: ${profile.phone}
Address: ${profile.address}
Summary: ${profile.summary}
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || ''}
Experience: ${profile.experience}
Education: ${profile.education}
    `.trim();

    setResumeText(resumeContent);

    try {
      await axios.post('http://localhost:5000/api/profile', profile);
      console.log('✅ Profile saved to server');
    } catch (err) {
      console.error('❌ Failed to save profile:', err);
    }
  };

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profile');
        if (res.data) {
          handleProfileUpdate(res.data);
        }
      } catch (err) {
        console.error('❌ Failed to load profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Generate tailored resume
  const handleGenerateResume = async () => {
    if (!jobInput.trim()) {
      setError('Please enter a job description or URL.');
      toast({
        title: "Missing Information",
        description: "Please enter a job description or URL to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/generate-resume', {
        jobDescription: jobInput,
        baseResume: resumeText,
      });
      
      setSuggestion(res.data.generatedResume || res.data.suggestion);
      
      toast({
        title: "Resume Generated!",
        description: "Your tailored resume has been successfully generated.",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate resume. Please check the input and try again.';
      setError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh resume from profile
  const handleRefreshResume = () => {
    if (Object.keys(profileData).length) {
      handleProfileUpdate(profileData);
      toast({
        title: "Resume Refreshed",
        description: "Your resume has been updated with the latest profile information.",
      });
    }
  };

  // Export to PDF
const exportToPDF = () => {
  if (!suggestion.trim()) {
    toast({
      title: "No Content",
      description: "Please generate or edit your resume before downloading.",
      variant: "destructive",
    });
    return;
  }

  try {
    const doc = new jsPDF({
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm'
    });
    const margin = 15;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    // Centered Name and Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(profileData.fullName, pageWidth / 2, y, { align: 'center' });
    y += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Fullstack Software Developer', pageWidth / 2, y, { align: 'center' });
    y += lineHeight * 2;

    // Contact Info
    doc.setFontSize(10);
    doc.text('orinabravin6@gmail.com | +254705885972 | Nairobi Road', pageWidth / 2, y, { align: 'center' });
    y += lineHeight * 2;

    // Header
    const addHeader = (text: string) => {
      y += lineHeight; // spacing before header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(text, margin, y);
      y += lineHeight;
    };

    // Paragraph
    const addParagraph = (text: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, maxLineWidth);
      lines.forEach(line => {
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    // Bullet List
    const addBulletList = (items: string[]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      items.forEach(item => {
        const lines = doc.splitTextToSize(`• ${item}`, maxLineWidth);
        lines.forEach(line => {
          doc.text(line, margin, y);
          y += lineHeight;
        });
      });
    };

    // Parse suggestion into sections
    const lines = suggestion.split('\n').map(line => line.trim()).filter(Boolean);

    lines.forEach(line => {
      const isHeader = /^[A-Z][A-Za-z\s]+$/.test(line) && !line.includes(':') && line.length < 30;
      if (isHeader) {
        addHeader(line);
      } else if (line.startsWith('-') || line.startsWith('•')) {
        addBulletList([line.replace(/^[-•]\s*/, '')]);
      } else {
        addParagraph(line);
      }

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('tailored_resume.pdf');

    toast({
      title: "PDF Downloaded",
      description: "Your edited resume has been saved as a PDF file.",
    });
  } catch (err) {
    toast({
      title: "Export Failed",
      description: "Failed to export PDF. Please try again.",
      variant: "destructive",
    });
  }
};

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Resume Tailor
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Create professionally tailored resumes that pass ATS systems
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Profile & Job Input */}
          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="p-6 bg-card shadow-card border-border/50">
              <Profile onUpdate={handleProfileUpdate} />
              
              <Separator className="my-6" />
              
              <Button
                onClick={handleRefreshResume}
                disabled={!Object.keys(profileData).length}
                variant="outline"
                className="w-full gap-2 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Resume from Profile
              </Button>
            </Card>

            {/* Job Input Section */}
            <Card className="p-6 bg-card shadow-card border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Job Targeting</h3>
                  <p className="text-sm text-muted-foreground">Tailor your resume to specific opportunities</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-input" className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Job Description or URL
                  </Label>
                  <Input
                    id="job-input"
                    value={jobInput}
                    onChange={(e) => setJobInput(e.target.value)}
                    placeholder="Paste job description or job posting URL..."
                    className="bg-input border-border focus:ring-ring focus:border-ring transition-colors"
                  />
                </div>

                <Button
                  onClick={handleGenerateResume}
                  disabled={loading || !jobInput.trim()}
                  className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-primary gap-2 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Tailored Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Tailored Resume
                    </>
                  )}
                </Button>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Generation Error</p>
                      <p className="text-sm text-destructive/80 mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Card className="p-6 bg-card shadow-card border-border/50 h-[calc(100vh-2rem)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
                    <Eye className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Live Preview</h3>
                    <p className="text-sm text-muted-foreground">Edit and export</p>
                  </div>
                </div>
                
                {suggestion && (
                  <Button
                    onClick={exportToPDF}
                    size="sm"
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-primary gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                )}
              </div>

              <div className="flex-1 flex flex-col h-[calc(100%-4rem)]">
                {suggestion ? (
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Ready for review and customization
                    </div>
                    
                    <Textarea
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      className="flex-1 resize-none bg-background border-border focus:ring-ring focus:border-ring font-mono text-sm leading-relaxed p-4"
                      placeholder="Your tailored resume will appear here..."
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-sm">
                      <div className="w-20 h-20 rounded-full bg-gradient-secondary flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-semibold text-card-foreground mb-2">Ready to Generate</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Complete your profile and add a job description to generate resume.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedResumeBuilder;