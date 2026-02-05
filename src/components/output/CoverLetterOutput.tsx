import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Download, Edit2, Check, X, Building, FlaskConical, Store, Calendar, MapPin } from 'lucide-react';
import { RoleType, ROLE_DESCRIPTIONS } from '@/types/student';
import { exportToPDF, exportToDOCX } from '@/utils/export';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
  hospital: <Building className="h-4 w-4" />,
  industry: <FlaskConical className="h-4 w-4" />,
  community: <Store className="h-4 w-4" />,
};

const ROLE_COLORS: Record<RoleType, string> = {
  hospital: 'from-blue-600 to-blue-800',
  industry: 'from-purple-600 to-purple-800',
  community: 'from-green-600 to-green-800',
};

export function CoverLetterOutput() {
  const { generatedOutputs, editedOutputs, setEditedOutputs, profile } = useProfile();
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [editContent, setEditContent] = useState('');

  if (!generatedOutputs) return null;

  const coverLetters = editedOutputs.coverLetters || generatedOutputs.coverLetters;

  const getContent = (role: RoleType) => {
    const edited = coverLetters.find((cl) => cl.role === role);
    const original = generatedOutputs.coverLetters.find((cl) => cl.role === role);
    return edited?.content || original?.content || '';
  };

  const handleEdit = (role: RoleType) => {
    setEditContent(getContent(role));
    setEditingRole(role);
  };

  const handleSave = () => {
    if (editingRole) {
      const updated = coverLetters.map((cl) =>
        cl.role === editingRole ? { ...cl, content: editContent } : cl
      );
      setEditedOutputs({ ...editedOutputs, coverLetters: updated });
      toast.success('Cover letter updated');
    }
    setEditingRole(null);
    setEditContent('');
  };

  const handleCancel = () => {
    setEditingRole(null);
    setEditContent('');
  };

  const handleExportPDF = async (role: RoleType) => {
    try {
      const content = getContent(role);
      await exportToPDF(content, `${profile.personal.fullName.replace(/\s+/g, '_')}_CoverLetter_${role}`);
      toast.success('Cover letter exported as PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportDOCX = async (role: RoleType) => {
    try {
      const content = getContent(role);
      await exportToDOCX(content, `${profile.personal.fullName.replace(/\s+/g, '_')}_CoverLetter_${role}`);
      toast.success('Cover letter exported as DOCX');
    } catch (error) {
      toast.error('Failed to export DOCX');
    }
  };

  // Parse cover letter for styled display
  const parseCoverLetter = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim());
    const paragraphs: string[] = [];
    let currentPara = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        if (currentPara) {
          paragraphs.push(currentPara);
          currentPara = '';
        }
      } else {
        currentPara += (currentPara ? ' ' : '') + trimmed;
      }
    }
    if (currentPara) paragraphs.push(currentPara);
    
    return paragraphs;
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
          <Mail className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Cover Letters
          </h3>
          <p className="text-xs text-muted-foreground">Tailored for each role type</p>
        </div>
      </div>

      <Tabs defaultValue={coverLetters[0]?.role} className="w-full">
        <TabsList className="w-full justify-start mb-4 bg-muted/50">
          {coverLetters.map((cl) => (
            <TabsTrigger 
              key={cl.role} 
              value={cl.role} 
              className="flex items-center gap-2 data-[state=active]:bg-card"
            >
              <span className="flex items-center gap-2">
                {ROLE_ICONS[cl.role]}
                <span className="hidden sm:inline">{ROLE_DESCRIPTIONS[cl.role]}</span>
                <span className="sm:hidden capitalize">{cl.role}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {coverLetters.map((cl) => {
          const paragraphs = parseCoverLetter(getContent(cl.role));
          
          return (
            <TabsContent key={cl.role} value={cl.role}>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  {ROLE_ICONS[cl.role]}
                  {ROLE_DESCRIPTIONS[cl.role]}
                </Badge>
                <div className="flex items-center gap-2">
                  {editingRole === cl.role ? (
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(cl.role)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportDOCX(cl.role)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        DOCX
                      </Button>
                      <Button
                        size="sm"
                        className="btn-export"
                        onClick={() => handleExportPDF(cl.role)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {editingRole === cl.role ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="editor-textarea min-h-[500px] font-mono text-sm"
                />
              ) : (
                <Card className="overflow-hidden shadow-lg border-2">
                  {/* Letter Header */}
                  <div className={`bg-gradient-to-r ${ROLE_COLORS[cl.role]} p-6`}>
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <h2 className="text-xl font-serif font-bold">
                          {profile.personal.fullName || 'Your Name'}
                        </h2>
                        <p className="text-sm opacity-90">
                          {profile.education.degree} Candidate
                        </p>
                      </div>
                      <div className="text-right text-sm opacity-90">
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" />
                          {currentDate}
                        </div>
                        {profile.personal.city && (
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <MapPin className="h-3 w-3" />
                            {profile.personal.city}, {profile.personal.country}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <CardContent className="p-8">
                      {/* Recipient placeholder */}
                      <div className="mb-6 space-y-1 text-sm text-muted-foreground">
                        <p>[Hiring Manager Name]</p>
                        <p>[Organization Name]</p>
                        <p>[Address]</p>
                      </div>

                      <Separator className="mb-6" />

                      {/* Letter body */}
                      <div className="space-y-4 text-foreground leading-relaxed">
                        {paragraphs.map((para, idx) => {
                          // First paragraph might be salutation
                          if (idx === 0 && para.toLowerCase().startsWith('dear')) {
                            return (
                              <p key={idx} className="font-medium">
                                {para}
                              </p>
                            );
                          }
                          // Last paragraph might be closing
                          if (idx === paragraphs.length - 1 && 
                              (para.toLowerCase().includes('sincerely') || 
                               para.toLowerCase().includes('regards') ||
                               para.toLowerCase().includes('yours'))) {
                            return (
                              <div key={idx} className="mt-8 space-y-4">
                                <p>{para.split(',')[0]},</p>
                                <div className="space-y-1">
                                  <p className="font-semibold text-foreground">
                                    {profile.personal.fullName || 'Your Name'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {profile.personal.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {profile.personal.phone}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <p key={idx} className="text-sm leading-7">
                              {para}
                            </p>
                          );
                        })}
                      </div>
                    </CardContent>
                  </ScrollArea>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
