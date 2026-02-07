import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  X, User, GraduationCap, Briefcase, FlaskConical, 
  Award, Target, Play, CheckCircle2, Loader2 
} from 'lucide-react';
import { SubmissionStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/submission';

interface ExperienceItem {
  id: string;
  organization: string;
  department: string;
  type: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
  achievements: string;
}

interface CertificationItem {
  id: string;
  name: string;
  provider: string;
  year: string;
}

interface StudentSubmission {
  id: string;
  reference_code: string;
  status: SubmissionStatus;
  full_name: string;
  email: string;
  phone?: string | null;
  linkedin_url?: string | null;
  nationality?: string | null;
  university: string;
  degree: string;
  graduation_year?: string | null;
  gpa?: string | null;
  coursework: string[];
  experience: ExperienceItem[];
  fyp_title?: string | null;
  fyp_supervisor?: string | null;
  fyp_objectives?: string | null;
  fyp_methods?: string | null;
  fyp_tools?: string | null;
  fyp_outcomes?: string | null;
  technical_skills: string[];
  soft_skills: string[];
  languages: unknown[];
  certifications: CertificationItem[];
  selected_roles: string[];
  job_description?: string | null;
  generated_outputs?: object | null;
  created_at: string;
  updated_at: string;
  processed_at?: string | null;
}

interface SubmissionDetailPanelProps {
  submission: StudentSubmission | null;
  onStatusChange: (id: string, status: SubmissionStatus) => Promise<void>;
  onClose: () => void;
}

export function SubmissionDetailPanel({ submission, onStatusChange, onClose }: SubmissionDetailPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!submission) {
    return (
      <Card className="flex items-center justify-center h-[calc(100vh-340px)]">
        <div className="text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Select a submission to view details</p>
        </div>
      </Card>
    );
  }

  const handleProceed = async () => {
    setIsProcessing(true);
    try {
      // First update status to processing
      await onStatusChange(submission.id, 'processing');
      
      // TODO: Call generate endpoint here
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update to completed
      await onStatusChange(submission.id, 'completed');
      toast.success('Career pack generated successfully!');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to generate career pack');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-[calc(100vh-340px)]">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-serif">{submission.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{submission.email}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">{submission.reference_code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[submission.status]}>
              {STATUS_LABELS[submission.status]}
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {/* Education */}
          <Section icon={GraduationCap} title="Education">
            <p className="font-medium">{submission.degree}</p>
            <p className="text-sm text-muted-foreground">{submission.university}</p>
            {submission.graduation_year && (
              <p className="text-sm text-muted-foreground">Graduation: {submission.graduation_year}</p>
            )}
            {submission.gpa && (
              <p className="text-sm text-muted-foreground">GPA: {submission.gpa}</p>
            )}
            {submission.coursework.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {submission.coursework.map((course, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{course}</Badge>
                ))}
              </div>
            )}
          </Section>

          {/* Experience */}
          {submission.experience.length > 0 && (
            <Section icon={Briefcase} title="Experience">
              <div className="space-y-3">
                {submission.experience.map((exp) => (
                  <div key={exp.id} className="text-sm">
                    <p className="font-medium">{exp.organization}</p>
                    <p className="text-muted-foreground">{exp.department} • {exp.type}</p>
                    <p className="text-xs text-muted-foreground">{exp.start_date} - {exp.end_date}</p>
                    {exp.responsibilities && (
                      <p className="mt-1 text-muted-foreground">{exp.responsibilities}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* FYP */}
          {submission.fyp_title && (
            <Section icon={FlaskConical} title="Research/FYP">
              <p className="font-medium">{submission.fyp_title}</p>
              {submission.fyp_supervisor && (
                <p className="text-sm text-muted-foreground">Supervisor: {submission.fyp_supervisor}</p>
              )}
              {submission.fyp_objectives && (
                <p className="text-sm mt-2">{submission.fyp_objectives}</p>
              )}
            </Section>
          )}

          {/* Skills */}
          <Section icon={Award} title="Skills">
            {submission.technical_skills.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Technical</p>
                <div className="flex flex-wrap gap-1">
                  {submission.technical_skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            {submission.soft_skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Soft Skills</p>
                <div className="flex flex-wrap gap-1">
                  {submission.soft_skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Target Roles */}
          {submission.selected_roles.length > 0 && (
            <Section icon={Target} title="Target Roles">
              <div className="flex flex-wrap gap-1">
                {submission.selected_roles.map((role, i) => (
                  <Badge key={i} className="bg-teal/20 text-teal">{role}</Badge>
                ))}
              </div>
            </Section>
          )}
        </CardContent>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t border-border bg-muted/30">
        {submission.status === 'pending' && (
          <Button 
            onClick={() => onStatusChange(submission.id, 'in_review')} 
            className="w-full"
          >
            Start Review
          </Button>
        )}
        {submission.status === 'in_review' && (
          <Button 
            onClick={handleProceed}
            disabled={isProcessing}
            className="w-full btn-generate"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Proceed to Generate
              </>
            )}
          </Button>
        )}
        {submission.status === 'processing' && (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </Button>
        )}
        {submission.status === 'completed' && (
          <Button variant="outline" className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            View Generated Pack
          </Button>
        )}
      </div>
    </Card>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-teal" />
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <div className="pl-6">{children}</div>
      <Separator className="mt-3" />
    </div>
  );
}
