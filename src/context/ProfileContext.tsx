import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  StudentProfile,
  GeneratedOutputs,
  EditedOutputs,
  SavedCase,
  createEmptyProfile,
} from '@/types/student';

interface ProfileContextType {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  updateProfile: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => void;
  generatedOutputs: GeneratedOutputs | null;
  setGeneratedOutputs: React.Dispatch<React.SetStateAction<GeneratedOutputs | null>>;
  editedOutputs: EditedOutputs;
  setEditedOutputs: React.Dispatch<React.SetStateAction<EditedOutputs>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  generationProgress: { step: string; progress: number };
  setGenerationProgress: React.Dispatch<React.SetStateAction<{ step: string; progress: number }>>;
  saveCase: () => void;
  loadCase: (caseData: SavedCase) => void;
  resetAll: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile>(createEmptyProfile());
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedOutputs | null>(null);
  const [editedOutputs, setEditedOutputs] = useState<EditedOutputs>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ step: '', progress: 0 });

  const updateProfile = useCallback(<K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveCase = useCallback(() => {
    const caseData: SavedCase = {
      version: '1.0.0',
      savedAt: new Date().toISOString(),
      profile,
      generatedOutputs,
      editedOutputs,
    };
    
    const blob = new Blob([JSON.stringify(caseData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-pack-${profile.personal.fullName.replace(/\s+/g, '-').toLowerCase() || 'student'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [profile, generatedOutputs, editedOutputs]);

  const loadCase = useCallback((caseData: SavedCase) => {
    setProfile(caseData.profile);
    setGeneratedOutputs(caseData.generatedOutputs);
    setEditedOutputs(caseData.editedOutputs);
  }, []);

  const resetAll = useCallback(() => {
    setProfile(createEmptyProfile());
    setGeneratedOutputs(null);
    setEditedOutputs({});
    setIsGenerating(false);
    setGenerationProgress({ step: '', progress: 0 });
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        generatedOutputs,
        setGeneratedOutputs,
        editedOutputs,
        setEditedOutputs,
        isGenerating,
        setIsGenerating,
        generationProgress,
        setGenerationProgress,
        saveCase,
        loadCase,
        resetAll,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
