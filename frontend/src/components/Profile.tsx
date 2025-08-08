import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, FileText, Trophy, Briefcase, GraduationCap, Upload, FileUp, CheckCircle } from 'lucide-react';

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

interface ProfileProps {
  onUpdate: (profile: ProfileData) => void;
}

const Profile: React.FC<ProfileProps> = ({ onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    skills: '',
    experience: '',
    education: ''
  });

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let parsedData: Partial<ProfileData> = {};

        // Try to parse as JSON first
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          parsedData = JSON.parse(content);
        } 
        // Try to parse as CSV
        else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          parsedData = parseCSV(content);
        }
        // Parse as plain text and extract information
        else {
          parsedData = parseTextResume(content);
        }

        // Update profile with parsed data
        const updatedProfile = { ...profile, ...parsedData };
        setProfile(updatedProfile);
        onUpdate(updatedProfile);

        toast({
          title: "Profile Imported Successfully",
          description: `Imported data from ${file.name}. Please review and adjust as needed.`,
        });

      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Could not parse the file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV format
  const parseCSV = (content: string): Partial<ProfileData> => {
    const lines = content.split('\n');
    const data: Partial<ProfileData> = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(',');
      const value = valueParts.join(',').trim().replace(/"/g, '');
      
      switch (key.toLowerCase().trim()) {
        case 'name':
        case 'fullname':
        case 'full_name':
          data.fullName = value;
          break;
        case 'email':
          data.email = value;
          break;
        case 'phone':
          data.phone = value;
          break;
        case 'address':
          data.address = value;
          break;
        case 'summary':
          data.summary = value;
          break;
        case 'skills':
          data.skills = value;
          break;
        case 'experience':
          data.experience = value;
          break;
        case 'education':
          data.education = value;
          break;
      }
    });
    
    return data;
  };

  // Parse plain text resume
  const parseTextResume = (content: string): Partial<ProfileData> => {
    const data: Partial<ProfileData> = {};
    const lines = content.split('\n');
    
    // Simple regex patterns to extract information
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;
    const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/;
    
    // Extract email
    const emailMatch = content.match(emailRegex);
    if (emailMatch) data.email = emailMatch[0];
    
    // Extract phone
    const phoneMatch = content.match(phoneRegex);
    if (phoneMatch) data.phone = phoneMatch[0];
    
    // Try to extract name from first few lines
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 50 && !firstLine.includes('@')) {
      data.fullName = firstLine;
    }
    
    // Extract skills section
    const skillsMatch = content.match(/(?:skills|technologies|technical skills):\s*(.+?)(?:\n\n|\n[A-Z]|$)/is);
    if (skillsMatch) data.skills = skillsMatch[1].trim();
    
    // Extract summary/objective
    const summaryMatch = content.match(/(?:summary|objective|profile):\s*(.+?)(?:\n\n|\n[A-Z]|$)/is);
    if (summaryMatch) data.summary = summaryMatch[1].trim();
    
    return data;
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    onUpdate(updatedProfile);
  };

  const inputSections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', icon: User },
        { key: 'email', label: 'Email', placeholder: 'john@example.com', icon: Mail, type: 'email' },
        { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567', icon: Phone, type: 'tel' },
        { key: 'address', label: 'Address', placeholder: 'City, State, Country', icon: MapPin }
      ]
    },
    {
      title: 'Professional Profile',
      icon: Trophy,
      fields: [
        { key: 'summary', label: 'Professional Summary', placeholder: 'Brief overview of your professional background...', icon: FileText, isTextarea: true },
        { key: 'skills', label: 'Skills', placeholder: 'JavaScript, React, Node.js, Python...', icon: Trophy },
        { key: 'experience', label: 'Work Experience', placeholder: 'Describe your work experience...', icon: Briefcase, isTextarea: true },
        { key: 'education', label: 'Education', placeholder: 'Your educational background...', icon: GraduationCap, isTextarea: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Build Your Professional Profile
        </h2>
        <p className="text-muted-foreground">Create a comprehensive profile to generate tailored resumes</p>
      </div>

      {/* Import Section */}
      <Card className="p-6 bg-gradient-secondary border-border/50 transition-all duration-300 hover:shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Upload className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Quick Import</h3>
            <p className="text-sm text-muted-foreground">Import from existing resume or profile data</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-20 flex-col gap-2 border-dashed border-2 hover:bg-muted/50 transition-all duration-300"
            >
              <FileUp className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Upload Resume File</span>
              <span className="text-xs text-muted-foreground">JSON, CSV, or Text</span>
            </Button>
            
            <div className="h-20 flex flex-col justify-center px-4 bg-muted/30 rounded-lg border border-dashed">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span>Supports multiple formats</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span>Auto-detects field mapping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span>Preserves existing data</span>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv,.txt"
            onChange={handleFileImport}
            className="hidden"
          />
          
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Supported formats:</strong> JSON (.json), CSV (.csv), Plain Text (.txt). 
            The system will automatically detect and extract profile information like name, email, phone, skills, and experience.
          </div>
        </div>
      </Card>

      <Separator className="my-6" />

      {inputSections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <Card key={section.title} className="p-6 bg-card shadow-card border-border/50 transition-all duration-300 hover:shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
                <SectionIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">{section.title}</h3>
            </div>
            
            <div className="grid gap-4">
              {section.fields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-sm font-medium text-card-foreground flex items-center gap-2">
                      <FieldIcon className="w-4 h-4 text-muted-foreground" />
                      {field.label}
                    </Label>
                    
                    {field.isTextarea ? (
                      <Textarea
                        id={field.key}
                        value={profile[field.key as keyof ProfileData]}
                        onChange={(e) => handleInputChange(field.key as keyof ProfileData, e.target.value)}
                        placeholder={field.placeholder}
                        className="min-h-[100px] resize-y bg-input border-border focus:ring-ring focus:border-ring transition-colors"
                      />
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type || 'text'}
                        value={profile[field.key as keyof ProfileData]}
                        onChange={(e) => handleInputChange(field.key as keyof ProfileData, e.target.value)}
                        placeholder={field.placeholder}
                        className="bg-input border-border focus:ring-ring focus:border-ring transition-colors"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default Profile;