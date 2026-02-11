import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CVOutput } from './CVOutput';
import { LinkedInOutput } from './LinkedInOutput';
import { CoverLetterOutput } from './CoverLetterOutput';
import { InterviewOutput } from './InterviewOutput';
import { SharePanel } from './SharePanel';
import { FileText, Linkedin, Mail, MessageSquare, Loader2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface OutputPanelProps {
  submissionId?: string;
  referenceCode?: string;
  studentName?: string;
}

export function OutputPanel({ submissionId, referenceCode, studentName }: OutputPanelProps) {
  const { generatedOutputs, isGenerating, generationProgress, profile } = useProfile();

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-12 w-12 text-teal" />
        </motion.div>
        <h3 className="mt-6 font-serif text-xl font-semibold text-foreground">
          Generating Your Career Pack
        </h3>
        <p className="mt-2 text-muted-foreground text-center max-w-sm">
          {generationProgress.step || 'Preparing your professional documents...'}
        </p>
        <div className="mt-4 w-64 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-teal"
            initial={{ width: 0 }}
            animate={{ width: `${generationProgress.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="mt-2 text-sm text-muted-foreground">
          {generationProgress.progress}%
        </span>
      </div>
    );
  }

  if (!generatedOutputs) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          No Outputs Yet
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Fill in your profile on the left and click "Generate Pack" to create your
          CV, LinkedIn content, cover letters, and interview prep materials.
        </p>
      </div>
    );
  }

  const name = studentName || profile.personal.fullName;

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="cv" className="flex flex-col h-full">
        <div className="flex-shrink-0 px-4 pt-4 border-b border-border">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="cv" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">CV</span>
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Cover</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <TabsContent value="cv" className="mt-0 h-full">
            <CVOutput />
          </TabsContent>
          <TabsContent value="linkedin" className="mt-0 h-full">
            <LinkedInOutput />
          </TabsContent>
          <TabsContent value="cover" className="mt-0 h-full">
            <CoverLetterOutput />
          </TabsContent>
          <TabsContent value="interview" className="mt-0 h-full">
            <InterviewOutput />
          </TabsContent>
          <TabsContent value="share" className="mt-0 h-full">
            {submissionId ? (
              <SharePanel
                outputs={generatedOutputs}
                studentName={name}
                submissionId={submissionId}
                referenceCode={referenceCode}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Share2 className="h-10 w-10 mx-auto mb-4 opacity-50" />
                <p>Select a student submission first to share documents.</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
