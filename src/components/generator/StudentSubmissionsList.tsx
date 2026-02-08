import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Eye, ArrowRight, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StudentSubmission } from '@/types/submission';
import { format } from 'date-fns';

interface StudentSubmissionsListProps {
  onSelectSubmission: (submission: StudentSubmission) => void;
  selectedId?: string;
}

export function StudentSubmissionsList({ onSelectSubmission, selectedId }: StudentSubmissionsListProps) {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data || []) as unknown as StudentSubmission[]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'in_review':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'processing':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Student Inquiries</h3>
          <Badge variant="secondary" className="text-xs">
            {submissions.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchSubmissions} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <ScrollArea className="h-[200px]">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No student inquiries yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence>
              {submissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                    selectedId === submission.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => onSelectSubmission(submission)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{submission.full_name}</p>
                        <Badge variant="outline" className={`text-[10px] ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {submission.degree} • {submission.university}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3 w-3" />
                      </Button>
                      {submission.status !== 'completed' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
