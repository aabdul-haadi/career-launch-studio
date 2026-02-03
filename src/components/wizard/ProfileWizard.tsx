import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { PersonalInfoStep } from './PersonalInfoStep';
import { EducationStep } from './EducationStep';
import { ExperienceStep } from './ExperienceStep';
import { FYPStep } from './FYPStep';
import { SkillsStep } from './SkillsStep';
import { CertificationsStep } from './CertificationsStep';
import { RoleTargetingStep } from './RoleTargetingStep';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  Wrench,
  Award,
  Target,
} from 'lucide-react';

const STEPS = [
  { id: 'personal', label: 'Personal', icon: User, component: PersonalInfoStep },
  { id: 'education', label: 'Education', icon: GraduationCap, component: EducationStep },
  { id: 'experience', label: 'Experience', icon: Briefcase, component: ExperienceStep },
  { id: 'fyp', label: 'FYP/Research', icon: FileText, component: FYPStep },
  { id: 'skills', label: 'Skills', icon: Wrench, component: SkillsStep },
  { id: 'certifications', label: 'Certifications', icon: Award, component: CertificationsStep },
  { id: 'targeting', label: 'Target Roles', icon: Target, component: RoleTargetingStep },
];

interface ProfileWizardProps {
  onGenerate: () => void;
}

export function ProfileWizard({ onGenerate }: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { profile, isGenerating } = useProfile();

  const CurrentStepComponent = STEPS[currentStep].component;

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Personal
        return (
          profile.personal.fullName &&
          profile.personal.email &&
          profile.personal.phone &&
          profile.personal.city &&
          profile.personal.country
        );
      case 1: // Education
        return profile.education.degree && profile.education.university;
      case 6: // Targeting
        return profile.selectedRoles.length > 0;
      default:
        return true;
    }
  };

  const canGenerate = () => {
    return (
      profile.personal.fullName &&
      profile.personal.email &&
      profile.education.university &&
      profile.selectedRoles.length > 0
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step Indicators */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-thin pb-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`
                  flex flex-col items-center gap-1 px-2 py-1 rounded-md transition-all min-w-[60px]
                  ${isActive ? 'bg-primary/10' : 'hover:bg-muted'}
                `}
              >
                <div
                  className={`
                    step-indicator
                    ${isActive ? 'step-indicator-active' : ''}
                    ${isComplete ? 'step-indicator-complete' : ''}
                    ${!isActive && !isComplete ? 'step-indicator-pending' : ''}
                  `}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`
                    text-xs whitespace-nowrap
                    ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentStepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-border bg-card/50">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={onGenerate}
                disabled={!canGenerate() || isGenerating}
                className="btn-generate"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Pack
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
