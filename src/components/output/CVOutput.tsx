import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Edit2, Check, X, User, GraduationCap, Briefcase, Award, Wrench } from 'lucide-react';
import { exportToPDF, exportToDOCX } from '@/utils/export';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function CVOutput() {
  const { generatedOutputs, editedOutputs, setEditedOutputs, profile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  if (!generatedOutputs) return null;

  const currentContent = editedOutputs.cv || generatedOutputs.cv;

  const handleEdit = () => {
    setEditContent(currentContent);
    setIsEditing(true);
  };

  const handleSave = () => {
    setEditedOutputs({ ...editedOutputs, cv: editContent });
    setIsEditing(false);
    toast.success('CV updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(currentContent, `${profile.personal.fullName.replace(/\s+/g, '_')}_CV`);
      toast.success('CV exported as PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportDOCX = async () => {
    try {
      await exportToDOCX(currentContent, `${profile.personal.fullName.replace(/\s+/g, '_')}_CV`);
      toast.success('CV exported as DOCX');
    } catch (error) {
      toast.error('Failed to export DOCX');
    }
  };

  // Parse CV sections for styled preview
  const parseCV = (content: string) => {
    const sections: { type: string; content: string[] }[] = [];
    const lines = content.split('\n');
    let currentSection = { type: 'header', content: [] as string[] };
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Detect section headers (all caps, no bullet)
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !trimmed.startsWith('•') && !trimmed.match(/^\d/)) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { type: trimmed.toLowerCase(), content: [] };
      } else {
        currentSection.content.push(line);
      }
    }
    
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const getSectionIcon = (type: string) => {
    if (type.includes('education')) return <GraduationCap className="h-4 w-4" />;
    if (type.includes('experience')) return <Briefcase className="h-4 w-4" />;
    if (type.includes('skill') || type.includes('technical')) return <Wrench className="h-4 w-4" />;
    if (type.includes('certif') || type.includes('award')) return <Award className="h-4 w-4" />;
    if (type.includes('summary') || type.includes('profile')) return <User className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const sections = parseCV(currentContent);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-teal flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Professional CV
            </h3>
            <p className="text-xs text-muted-foreground">ATS-optimized format</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-success hover:bg-success/90">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportDOCX}>
                <Download className="h-4 w-4 mr-1" />
                DOCX
              </Button>
              <Button size="sm" className="btn-export" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="editor-textarea min-h-[600px] font-mono text-sm"
        />
      ) : (
        <Card className="overflow-hidden shadow-lg border-2">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
            {/* Header from first section */}
            {sections[0]?.type === 'header' && (
              <div className="text-center space-y-2">
                {sections[0].content.map((line, idx) => {
                  if (idx === 0) {
                    return (
                      <h1 key={idx} className="text-2xl font-serif font-bold tracking-wide">
                        {line.trim()}
                      </h1>
                    );
                  }
                  if (line.includes('|') || line.includes('@')) {
                    return (
                      <p key={idx} className="text-sm opacity-90 flex items-center justify-center gap-2 flex-wrap">
                        {line.split('|').map((part, pIdx) => (
                          <span key={pIdx} className="flex items-center gap-1">
                            {pIdx > 0 && <span className="mx-1">•</span>}
                            {part.trim()}
                          </span>
                        ))}
                      </p>
                    );
                  }
                  return (
                    <p key={idx} className="text-sm opacity-80">{line.trim()}</p>
                  );
                })}
              </div>
            )}
          </div>

          <ScrollArea className="h-[500px]">
            <CardContent className="p-6 space-y-6">
              {sections.slice(sections[0]?.type === 'header' ? 1 : 0).map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                      {getSectionIcon(section.type)}
                    </div>
                    <h2 className="font-serif text-lg font-semibold text-foreground uppercase tracking-wide">
                      {section.type.replace(/-/g, ' ')}
                    </h2>
                  </div>
                  <Separator className="bg-teal/20" />
                  <div className="pl-10 space-y-2">
                    {section.content.map((line, lineIdx) => {
                      const trimmed = line.trim();
                      if (trimmed.startsWith('•')) {
                        return (
                          <div key={lineIdx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 flex-shrink-0" />
                            <p className="text-sm text-foreground leading-relaxed">
                              {trimmed.substring(1).trim()}
                            </p>
                          </div>
                        );
                      }
                      if (trimmed.includes('|')) {
                        const parts = trimmed.split('|').map(p => p.trim());
                        return (
                          <div key={lineIdx} className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-medium text-foreground">{parts[0]}</span>
                            {parts[1] && (
                              <Badge variant="secondary" className="text-xs">
                                {parts[1]}
                              </Badge>
                            )}
                          </div>
                        );
                      }
                      return (
                        <p key={lineIdx} className="text-sm text-foreground leading-relaxed">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
