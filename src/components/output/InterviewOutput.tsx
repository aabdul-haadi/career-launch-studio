import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageSquare, Download, Building, FlaskConical, Store, User, Brain, HelpCircle } from 'lucide-react';
import { RoleType, ROLE_DESCRIPTIONS } from '@/types/student';
import { exportToPDF } from '@/utils/export';
import { toast } from 'sonner';

const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
  hospital: <Building className="h-4 w-4" />,
  industry: <FlaskConical className="h-4 w-4" />,
  community: <Store className="h-4 w-4" />,
};

export function InterviewOutput() {
  const { generatedOutputs, profile } = useProfile();

  if (!generatedOutputs) return null;

  const { interviewPrep } = generatedOutputs;

  const handleExportPDF = async (role: RoleType) => {
    const prep = interviewPrep.find((p) => p.role === role);
    if (!prep) return;

    const content = `INTERVIEW PREPARATION - ${ROLE_DESCRIPTIONS[role].toUpperCase()}
==================================================

TELL ME ABOUT YOURSELF

30-Second Version:
${prep.tellMeAboutYourself.short}

90-Second Version:
${prep.tellMeAboutYourself.long}

BEHAVIORAL QUESTIONS (STAR Format)
===================================
${prep.behavioral.map((q, i) => `
${i + 1}. ${q.question}

Answer:
${q.answer}
`).join('\n')}

TECHNICAL QUESTIONS
===================
${prep.technical.map((q, i) => `
${i + 1}. ${q.question}

Answer:
${q.answer}
`).join('\n')}

QUESTIONS TO ASK THE INTERVIEWER
================================
${prep.questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;

    try {
      await exportToPDF(content, `${profile.personal.fullName.replace(/\s+/g, '_')}_InterviewPrep_${role}`);
      toast.success('Interview prep exported as PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-teal" />
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Interview Preparation
        </h3>
      </div>

      <Tabs defaultValue={interviewPrep[0]?.role} className="w-full">
        <TabsList className="w-full justify-start mb-4">
          {interviewPrep.map((prep) => (
            <TabsTrigger key={prep.role} value={prep.role} className="flex items-center gap-2">
              {ROLE_ICONS[prep.role]}
              <span className="hidden sm:inline">{ROLE_DESCRIPTIONS[prep.role]}</span>
              <span className="sm:hidden">{prep.role}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {interviewPrep.map((prep) => (
          <TabsContent key={prep.role} value={prep.role} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                {ROLE_DESCRIPTIONS[prep.role]}
              </h4>
              <Button
                size="sm"
                className="btn-export"
                onClick={() => handleExportPDF(prep.role)}
              >
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>

            {/* Tell Me About Yourself */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-teal" />
                "Tell Me About Yourself"
              </h5>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    30-Second Version
                  </span>
                  <p className="mt-1 text-sm text-foreground bg-muted p-3 rounded-md">
                    {prep.tellMeAboutYourself.short}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    90-Second Version
                  </span>
                  <p className="mt-1 text-sm text-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {prep.tellMeAboutYourself.long}
                  </p>
                </div>
              </div>
            </div>

            {/* Behavioral Questions */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-teal" />
                Behavioral Questions (STAR Format)
              </h5>
              <Accordion type="single" collapsible className="w-full">
                {prep.behavioral.map((qa, index) => (
                  <AccordionItem key={index} value={`behavioral-${index}`}>
                    <AccordionTrigger className="text-sm text-left">
                      {index + 1}. {qa.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                        {qa.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Technical Questions */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-teal" />
                Technical Questions
              </h5>
              <Accordion type="single" collapsible className="w-full">
                {prep.technical.map((qa, index) => (
                  <AccordionItem key={index} value={`technical-${index}`}>
                    <AccordionTrigger className="text-sm text-left">
                      {index + 1}. {qa.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                        {qa.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Questions to Ask */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-teal" />
                Questions to Ask the Interviewer
              </h5>
              <ul className="space-y-2">
                {prep.questionsToAsk.map((question, index) => (
                  <li
                    key={index}
                    className="text-sm text-foreground p-2 bg-muted rounded-md"
                  >
                    {index + 1}. {question}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
