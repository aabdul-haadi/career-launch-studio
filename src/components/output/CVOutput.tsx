import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileText, Edit2, Check, X } from 'lucide-react';
import { exportToPDF, exportToDOCX } from '@/utils/export';
import { toast } from 'sonner';

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

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal" />
          ATS-Friendly CV
        </h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
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
          className="editor-textarea min-h-[600px]"
        />
      ) : (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {currentContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
