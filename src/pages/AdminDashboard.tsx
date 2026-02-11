import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Pill, LogOut, Users, Clock, CheckCircle2, 
  Eye, Play, Loader2, RefreshCw, ClipboardList 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { SubmissionStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/submission';
import { SubmissionDetailPanel } from '@/components/admin/SubmissionDetailPanel';
import { generateStudentDataForm } from '@/utils/generateStudentForm';

// Local type to handle Supabase JSON fields
interface SubmissionRecord {
  id: string;
  reference_code: string;
  status: SubmissionStatus;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  nationality: string | null;
  university: string;
  degree: string;
  graduation_year: string | null;
  gpa: string | null;
  coursework: unknown;
  experience: unknown;
  fyp_title: string | null;
  fyp_supervisor: string | null;
  fyp_objectives: string | null;
  fyp_methods: string | null;
  fyp_tools: string | null;
  fyp_outcomes: string | null;
  technical_skills: unknown;
  soft_skills: unknown;
  languages: unknown;
  certifications: unknown;
  selected_roles: unknown;
  job_description: string | null;
  generated_outputs: unknown;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

function parseSubmission(record: SubmissionRecord) {
  return {
    ...record,
    coursework: Array.isArray(record.coursework) ? record.coursework as string[] : [],
    experience: Array.isArray(record.experience) ? record.experience : [],
    technical_skills: Array.isArray(record.technical_skills) ? record.technical_skills as string[] : [],
    soft_skills: Array.isArray(record.soft_skills) ? record.soft_skills as string[] : [],
    languages: Array.isArray(record.languages) ? record.languages : [],
    certifications: Array.isArray(record.certifications) ? record.certifications : [],
    selected_roles: Array.isArray(record.selected_roles) ? record.selected_roles as string[] : [],
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [submissions, setSubmissions] = useState<ReturnType<typeof parseSubmission>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ReturnType<typeof parseSubmission> | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data || []).map(d => parseSubmission(d as SubmissionRecord)));
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusChange = async (id: string, newStatus: SubmissionStatus) => {
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ 
          status: newStatus,
          processed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.map(s => 
        s.id === id ? { ...s, status: newStatus } : s
      ));
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredSubmissions = statusFilter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === statusFilter);

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    inReview: submissions.filter(s => s.status === 'in_review').length,
    processing: submissions.filter(s => s.status === 'processing').length,
    completed: submissions.filter(s => s.status === 'completed').length,
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <Pill className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage student submissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  generateStudentDataForm();
                  toast.success('Form template downloaded');
                }}
              >
                <ClipboardList className="h-4 w-4 mr-1" />
                Get Form
              </Button>
              <Button variant="outline" size="sm" onClick={fetchSubmissions}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'bg-primary' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
            { label: 'In Review', value: stats.inReview, icon: Eye, color: 'bg-blue-500' },
            { label: 'Processing', value: stats.processing, icon: Play, color: 'bg-purple-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-green-500' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Submissions List */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif">Submissions</CardTitle>
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubmissionStatus | 'all')}>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs px-2">Pending</TabsTrigger>
                    <TabsTrigger value="in_review" className="text-xs px-2">Review</TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs px-2">Done</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-[calc(100vh-340px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No submissions found</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {filteredSubmissions.map((submission) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedSubmission?.id === submission.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{submission.full_name}</p>
                              <p className="text-sm text-muted-foreground truncate">{submission.email}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-mono">{submission.reference_code}</span>
                                <span className="mx-1">•</span>
                                {new Date(submission.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={STATUS_COLORS[submission.status]}>
                              {STATUS_LABELS[submission.status].split(' ')[0]}
                            </Badge>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <SubmissionDetailPanel
            submission={selectedSubmission as Parameters<typeof SubmissionDetailPanel>[0]['submission']}
            onStatusChange={handleStatusChange}
            onClose={() => setSelectedSubmission(null)}
          />
        </div>
      </div>
    </div>
  );
}
