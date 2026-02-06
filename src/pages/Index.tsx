import { useRef, useState } from 'react';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { ProfileWizard } from '@/components/wizard/ProfileWizard';
import { OutputPanel } from '@/components/output/OutputPanel';
import { IntelligencePanel } from '@/components/intelligence/IntelligencePanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateCareerPack } from '@/services/generateService';
import { SavedCase } from '@/types/student';
import { toast } from 'sonner';
import { Save, Upload, RotateCcw, Pill, FileText, Brain, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateStudentDataForm } from '@/utils/generateStudentForm';

function AppContent() {
  const {
    profile,
    setGeneratedOutputs,
    setIsGenerating,
    setGenerationProgress,
    saveCase,
    loadCase,
    resetAll,
    generatedOutputs,
  } = useProfile();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'outputs' | 'intelligence'>('outputs');

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress({ step: 'Starting generation...', progress: 5 });

      const outputs = await generateCareerPack(profile, {
        onProgress: (step, progress) => {
          setGenerationProgress({ step, progress });
        },
      });

      setGeneratedOutputs(outputs);
      setGenerationProgress({ step: 'Complete!', progress: 100 });
      toast.success('Career pack generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate career pack');
    } finally {
      setIsGenerating(false);
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
        toast.success('Case loaded successfully!');
      } catch (error) {
        toast.error('Invalid case file');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetAll();
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Wizard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Student Profile
              </h2>
              <p className="text-xs text-muted-foreground">
                Fill in your details to generate your career pack
              </p>
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
