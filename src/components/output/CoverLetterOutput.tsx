import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Download, Edit2, Check, X, Building, FlaskConical, Store } from 'lucide-react';
import { RoleType, ROLE_DESCRIPTIONS } from '@/types/student';
import { exportToPDF, exportToDOCX } from '@/utils/export';
import { toast } from 'sonner';

const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
  hospital: <Building className="h-4 w-4" />,
  industry: <FlaskConical className="h-4 w-4" />,
  community: <Store className="h-4 w-4" />,
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

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-teal" />
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Cover Letters
        </h3>
      </div>

      <Tabs defaultValue={coverLetters[0]?.role} className="w-full">
        <TabsList className="w-full justify-start mb-4">
          {coverLetters.map((cl) => (
            <TabsTrigger key={cl.role} value={cl.role} className="flex items-center gap-2">
              {ROLE_ICONS[cl.role]}
              <span className="hidden sm:inline">{ROLE_DESCRIPTIONS[cl.role]}</span>
              <span className="sm:hidden">{cl.role}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {coverLetters.map((cl) => (
          <TabsContent key={cl.role} value={cl.role}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">
                {ROLE_DESCRIPTIONS[cl.role]}
              </h4>
              <div className="flex items-center gap-2">
                {editingRole === cl.role ? (
                  <>
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
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
                className="editor-textarea min-h-[400px]"
              />
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {getContent(cl.role)}
                </pre>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
