import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pill, Search, ArrowLeft, CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubmissionStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/submission';

interface SubmissionData {
  reference_code: string;
  status: SubmissionStatus;
  full_name: string;
  email: string;
  created_at: string;
  processed_at: string | null;
}

export default function StatusCheck() {
  const [searchParams] = useSearchParams();
  const [referenceCode, setReferenceCode] = useState(searchParams.get('ref') || '');
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('ref')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!referenceCode.trim()) {
      setError('Please enter a reference code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('student_submissions')
        .select('reference_code, status, full_name, email, created_at, processed_at')
        .eq('reference_code', referenceCode.toUpperCase().trim())
        .single();

      if (fetchError || !data) {
        setError('No submission found with this reference code');
        setSubmission(null);
      } else {
        setSubmission(data as SubmissionData);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />;
      default:
        return <Clock className="h-6 w-6 text-amber-600" />;
    }
  };

  const getStatusStep = (status: SubmissionStatus) => {
    const steps = ['pending', 'in_review', 'processing', 'completed'];
    return steps.indexOf(status) + 1;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary">
                <Pill className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-bold">Check Status</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Track Your Application</CardTitle>
              <CardDescription>
                Enter your reference code to check the status of your career pack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="ref" className="sr-only">Reference Code</Label>
                  <Input
                    id="ref"
                    value={referenceCode}
                    onChange={e => setReferenceCode(e.target.value)}
                    placeholder="CLR-XXXXXXXX"
                    className="text-center font-mono uppercase"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {error && (
                <p className="text-center text-destructive text-sm">{error}</p>
              )}

              {submission && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-4 border-t"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      {getStatusIcon(submission.status)}
                    </div>
                    <Badge className={STATUS_COLORS[submission.status]}>
                      {STATUS_LABELS[submission.status]}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Reference: <span className="font-mono">{submission.reference_code}</span>
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="space-y-3">
                    {(['pending', 'in_review', 'processing', 'completed'] as SubmissionStatus[]).map((step, index) => {
                      const currentStep = getStatusStep(submission.status);
                      const stepNumber = index + 1;
                      const isComplete = stepNumber < currentStep;
                      const isCurrent = stepNumber === currentStep;

                      return (
                        <div
                          key={step}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isCurrent ? 'bg-primary/10 border border-primary/20' : 
                            isComplete ? 'bg-green-50' : 'bg-muted/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isComplete ? 'bg-green-600 text-white' :
                            isCurrent ? 'bg-primary text-primary-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isComplete ? '✓' : stepNumber}
                          </div>
                          <span className={`flex-1 ${isCurrent ? 'font-medium' : ''}`}>
                            {STATUS_LABELS[step]}
                          </span>
                          {isCurrent && step === 'processing' && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                    <p>Submitted on {new Date(submission.created_at).toLocaleDateString()}</p>
                    {submission.processed_at && (
                      <p>Completed on {new Date(submission.processed_at).toLocaleDateString()}</p>
                    )}
                  </div>

                  {submission.status === 'completed' && (
                    <div className="flex justify-center">
                      <Button className="btn-export">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Career Pack
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
