import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, FileText, Linkedin, Mail, MessageSquare } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed';
}

interface ProcessingProgressProps {
  currentStep: string;
  progress: number;
  isProcessing: boolean;
}

export function ProcessingProgress({ currentStep, progress, isProcessing }: ProcessingProgressProps) {
  const steps: ProcessingStep[] = [
    { id: 'cv', label: 'Generating CV', icon: <FileText className="h-4 w-4" />, status: 'pending' },
    { id: 'linkedin', label: 'LinkedIn Profile', icon: <Linkedin className="h-4 w-4" />, status: 'pending' },
    { id: 'coverLetter', label: 'Cover Letters', icon: <Mail className="h-4 w-4" />, status: 'pending' },
    { id: 'interview', label: 'Interview Prep', icon: <MessageSquare className="h-4 w-4" />, status: 'pending' },
  ];

  // Update step statuses based on progress
  const getStepStatus = (stepIndex: number): 'pending' | 'processing' | 'completed' => {
    const stepProgress = (stepIndex + 1) * 25;
    if (progress >= stepProgress) return 'completed';
    if (progress >= stepProgress - 25 && isProcessing) return 'processing';
    return 'pending';
  };

  if (!isProcessing && progress === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Generating Career Pack</h3>
        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      <p className="text-sm text-muted-foreground">{currentStep}</p>

      <div className="grid grid-cols-2 gap-2">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                status === 'completed'
                  ? 'bg-green-500/10 text-green-600'
                  : status === 'processing'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : status === 'processing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                step.icon
              )}
              <span className="text-xs">{step.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
