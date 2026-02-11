import { useRef, useState, useCallback } from 'react';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { ProfileWizard } from '@/components/wizard/ProfileWizard';
import { OutputPanel } from '@/components/output/OutputPanel';
import { IntelligencePanel } from '@/components/intelligence/IntelligencePanel';
import { StudentSubmissionsList } from '@/components/generator/StudentSubmissionsList';
import { ProcessingProgress } from '@/components/generator/ProcessingProgress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateCareerPack } from '@/services/generateService';
import { SavedCase, StudentProfile, RoleType, GeneratedOutputs } from '@/types/student';
import { StudentSubmission } from '@/types/submission';
import { toast } from 'sonner';
import { Save, Upload, RotateCcw, Pill, FileText, Brain, ClipboardList, Download, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateStudentDataForm } from '@/utils/generateStudentForm';
import { exportBrandedCareerPack } from '@/utils/exportBrandedPDF';
import { supabase } from '@/integrations/supabase/client';

function AppContent() {
  const {
    profile,
    setProfile,
    setGeneratedOutputs,
    setIsGenerating,
    setGenerationProgress,
    saveCase,
    loadCase,
    resetAll,
    generatedOutputs,
    isGenerating,
    generationProgress,
  } = useProfile();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'outputs' | 'intelligence'>('outputs');
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [showInquiries, setShowInquiries] = useState(true);

  // Convert StudentSubmission to StudentProfile
  const submissionToProfile = useCallback((submission: StudentSubmission): StudentProfile => {
    return {
      personal: {
        fullName: submission.full_name,
        phone: submission.phone || '',
        email: submission.email,
        city: '',
        country: submission.nationality || '',
        linkedinUrl: submission.linkedin_url,
      },
      education: {
        degree: (submission.degree as 'PharmD' | 'BPharm' | 'MPharm' | 'Other') || 'PharmD',
        university: submission.university,
        graduationDate: submission.graduation_year || '',
        gpa: submission.gpa,
        coursework: submission.coursework || [],
      },
      experience: (submission.experience || []).map((exp) => ({
        id: exp.id,
        organization: exp.organization,
        department: exp.department,
        startDate: exp.start_date,
        endDate: exp.end_date,
        responsibilities: exp.responsibilities,
        achievements: exp.achievements,
        type: exp.type,
      })),
      fyp: {
        title: submission.fyp_title || '',
        objectives: submission.fyp_objectives || '',
        methods: submission.fyp_methods || '',
        tools: submission.fyp_tools?.split(',').map(t => t.trim()) || [],
        outcomes: submission.fyp_outcomes,
      },
      skills: {
        hardSkills: submission.technical_skills || [],
        softSkills: submission.soft_skills || [],
        tools: [],
      },
      certifications: (submission.certifications || []).map((cert) => ({
        id: cert.id,
        name: cert.name,
        provider: cert.provider,
        year: cert.year,
      })),
      activities: [],
      selectedRoles: (submission.selected_roles || []) as RoleType[],
      rolePreferences: [],
      jobDescription: submission.job_description,
    };
  }, []);

  const handleSelectSubmission = useCallback((submission: StudentSubmission) => {
    setSelectedSubmission(submission);
    const convertedProfile = submissionToProfile(submission);
    setProfile(convertedProfile);
    
    // If already has generated outputs, load them
    if (submission.generated_outputs) {
      setGeneratedOutputs(submission.generated_outputs as unknown as GeneratedOutputs);
    } else {
      setGeneratedOutputs(null);
    }
    
    toast.success(`Loaded ${submission.full_name}'s profile`);
  }, [submissionToProfile, setProfile, setGeneratedOutputs]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({ step: 'Starting generation...', progress: 5 });

      // Update submission status to processing if we have one selected
      if (selectedSubmission) {
        await supabase
          .from('student_submissions')
          .update({ status: 'processing' })
          .eq('id', selectedSubmission.id);
      }

      const outputs = await generateCareerPack(profile, {
        onProgress: (step, progress) => {
          setGenerationProgress({ step, progress });
        },
      });

      setGeneratedOutputs(outputs);
      setGenerationProgress({ step: 'Complete!', progress: 100 });

      // Update submission with generated outputs and mark as completed
      if (selectedSubmission) {
        await supabase
          .from('student_submissions')
          .update({ 
            status: 'completed',
            generated_outputs: JSON.parse(JSON.stringify(outputs)),
            processed_at: new Date().toISOString(),
          })
          .eq('id', selectedSubmission.id);
        
        setSelectedSubmission({ ...selectedSubmission, status: 'completed', generated_outputs: outputs as unknown as Record<string, unknown> });
      }

      toast.success('Career pack generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate career pack');
      
      // Reset status on error
      if (selectedSubmission) {
        await supabase
          .from('student_submissions')
          .update({ status: 'in_review' })
          .eq('id', selectedSubmission.id);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportBrandedPDF = async () => {
    if (!generatedOutputs) {
      toast.error('No generated outputs to export');
      return;
    }
    
    try {
      await exportBrandedCareerPack(generatedOutputs, profile.personal.fullName, selectedSubmission?.reference_code);
      toast.success('Career Launch Pack PDF downloaded!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleLoadCase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const caseData = JSON.parse(e.target?.result as string) as SavedCase;
        loadCase(caseData);
        setSelectedSubmission(null);
        toast.success('Case loaded successfully!');
      } catch (error) {
        toast.error('Invalid case file');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetAll();
      setSelectedSubmission(null);
      toast.info('All data has been reset');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="p-2 rounded-lg bg-primary"
              >
                <Pill className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="font-serif text-xl font-bold text-foreground">
                  Career Launch Pack Generator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Pharmacy Final Year • AI-Powered Career Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInquiries(!showInquiries)}
                className={showInquiries ? 'bg-primary/10 border-primary' : ''}
              >
                <Users className="h-4 w-4 mr-1" />
                Inquiries
              </Button>
              {generatedOutputs && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExportBrandedPDF}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  generateStudentDataForm();
                  toast.success('Student data form downloaded!');
                }}
                className="text-primary border-primary/30 hover:bg-primary/10"
              >
                <ClipboardList className="h-4 w-4 mr-1" />
                Get Form
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleLoadCase}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Load
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveCase}
                disabled={!profile.personal.fullName}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
        {/* Student Inquiries Panel */}
        {showInquiries && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <StudentSubmissionsList
              onSelectSubmission={handleSelectSubmission}
              selectedId={selectedSubmission?.id}
            />
          </motion.div>
        )}

        {/* Processing Progress */}
        {isGenerating && (
          <div className="mb-4">
            <ProcessingProgress
              currentStep={generationProgress.step}
              progress={generationProgress.progress}
              isProcessing={isGenerating}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px-${showInquiries ? '240px' : '0px'})]">
          {/* Left Panel - Wizard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-foreground">
                    {selectedSubmission ? selectedSubmission.full_name : 'Student Profile'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedSubmission 
                      ? `${selectedSubmission.reference_code} • Review and generate`
                      : 'Fill in details or select from inquiries'}
                  </p>
                </div>
                {selectedSubmission && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSubmission(null);
                      resetAll();
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ProfileWizard onGenerate={handleGenerate} />
            </div>
          </motion.div>

          {/* Right Panel - Outputs & Intelligence */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col"
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'outputs' | 'intelligence')} className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <TabsList className="grid grid-cols-2 w-full max-w-sm">
                  <TabsTrigger value="outputs" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="intelligence" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Intelligence
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="outputs" className="flex-1 overflow-hidden mt-0">
                <OutputPanel />
              </TabsContent>

              <TabsContent value="intelligence" className="flex-1 overflow-hidden mt-0">
                <IntelligencePanel />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}
