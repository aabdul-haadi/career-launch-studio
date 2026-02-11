import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, Loader2, FileText, Mail, Linkedin, MessageSquare, Clock } from 'lucide-react';
import { GeneratedOutputs, RoleType, ROLE_DESCRIPTIONS } from '@/types/student';
import { exportBrandedCareerPack, generateDocumentPDFBytes } from '@/utils/exportBrandedPDF';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SharePanelProps {
  outputs: GeneratedOutputs;
  studentName: string;
  submissionId: string;
  referenceCode?: string;
  onShared?: () => void;
}

interface DocOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
}

export function SharePanel({ outputs, studentName, submissionId, referenceCode, onShared }: SharePanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const docOptions: DocOption[] = [
    { id: 'full-pack', label: 'Complete Career Launch Pack', icon: <FileText className="h-4 w-4" />, type: 'full' },
    { id: 'cv', label: 'CV / Resume', icon: <FileText className="h-4 w-4" />, type: 'cv' },
    { id: 'linkedin', label: 'LinkedIn Optimization', icon: <Linkedin className="h-4 w-4" />, type: 'linkedin' },
    ...outputs.coverLetters.map(cl => ({
      id: `cover-${cl.role}`,
      label: `Cover Letter — ${ROLE_DESCRIPTIONS[cl.role]}`,
      icon: <Mail className="h-4 w-4" />,
      type: `cover-${cl.role}`,
    })),
    ...outputs.interviewPrep.map(ip => ({
      id: `interview-${ip.role}`,
      label: `Interview Prep — ${ROLE_DESCRIPTIONS[ip.role]}`,
      icon: <MessageSquare className="h-4 w-4" />,
      type: `interview-${ip.role}`,
    })),
  ];

  const toggleDoc = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === docOptions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(docOptions.map(d => d.id)));
    }
  };

  const handleUpload = async () => {
    if (selected.size === 0) {
      toast.error('Please select at least one document to share');
      return;
    }

    setIsUploading(true);
    try {
      const documents: { name: string; type: string; base64Data: string }[] = [];

      for (const docId of selected) {
        const option = docOptions.find(d => d.id === docId);
        if (!option) continue;

        const pdfBytes = await generateDocumentPDFBytes(
          outputs,
          studentName,
          option.type,
          referenceCode
        );

        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(pdfBytes))
        );

        const safeName = studentName.replace(/\s+/g, '_');
        const fileName = option.type === 'full'
          ? `Career_Launch_Pack_${safeName}.pdf`
          : `${option.type.replace(/-/g, '_')}_${safeName}.pdf`;

        documents.push({
          name: fileName,
          type: option.type,
          base64Data: base64,
        });
      }

      const { data, error } = await supabase.functions.invoke('upload-career-pack', {
        body: { submissionId, documents },
      });

      if (error) throw error;

      setIsUploaded(true);
      toast.success(`${documents.length} document(s) shared! Available for 48 hours.`);
      onShared?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  if (isUploaded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-serif text-lg font-semibold">Documents Shared!</h3>
        <p className="text-sm text-muted-foreground">
          {referenceCode && (
            <>Student can download using code: <span className="font-mono font-bold text-foreground">{referenceCode}</span></>
          )}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Available for 48 hours</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsUploaded(false)}>
          Share More Documents
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-semibold text-foreground">Share with Student</h3>
        <Button variant="ghost" size="sm" onClick={selectAll}>
          {selected.size === docOptions.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="space-y-2">
        {docOptions.map((doc) => (
          <motion.label
            key={doc.id}
            whileHover={{ scale: 1.01 }}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selected.has(doc.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <Checkbox
              checked={selected.has(doc.id)}
              onCheckedChange={() => toggleDoc(doc.id)}
            />
            <span className="text-muted-foreground">{doc.icon}</span>
            <span className="text-sm flex-1">{doc.label}</span>
            {doc.id === 'full-pack' && (
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            )}
          </motion.label>
        ))}
      </div>

      <Button
        onClick={handleUpload}
        disabled={selected.size === 0 || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Share {selected.size} Document{selected.size !== 1 ? 's' : ''} (48hr access)
          </>
        )}
      </Button>
    </div>
  );
}
