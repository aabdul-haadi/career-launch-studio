import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Loader2, 
  Download, 
  AlertTriangle,
  Sparkles,
  Calendar,
  Mail,
  User,
  Eye,
  Shield,
  ChevronRight,
  Hourglass
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubmissionStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/submission';
import { toast } from 'sonner';

interface SharedDocument {
  name: string;
  type: string;
  storagePath: string;
  size: number;
}

interface SubmissionData {
  reference_code: string;
  status: SubmissionStatus;
  full_name: string;
  email: string;
  created_at: string;
  processed_at: string | null;
  shared_documents: SharedDocument[] | null;
  shared_at: string | null;
  share_expires_at: string | null;
}

// Floating background elements
const FloatingElement = ({ delay, x, y, children }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.1, 0.2, 0.1],
      scale: [1, 1.2, 1],
      x: [0, x, 0],
      y: [0, y, 0]
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none"
  >
    {children}
  </motion.div>
);

export default function StatusCheck() {
  const [searchParams] = useSearchParams();
  const [referenceCode, setReferenceCode] = useState(searchParams.get('ref') || '');
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('ref')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!referenceCode.trim()) {
      setError('Please enter your reference code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('student_submissions')
        .select('reference_code, status, full_name, email, created_at, processed_at, shared_documents, shared_at, share_expires_at')
        .eq('reference_code', referenceCode.toUpperCase().trim())
        .single();

      if (fetchError || !data) {
        setError('No application found with this reference code');
        setSubmission(null);
      } else {
        setSubmission(data as unknown as SubmissionData);
        toast.success('Application found!', {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc: SharedDocument) => {
    setDownloadingDoc(doc.name);
    try {
      const { data, error } = await supabase.functions.invoke('get-download-url', {
        body: { storagePath: doc.storagePath },
      });

      if (error || !data?.signedUrl) {
        throw new Error('Failed to get download link');
      }

      const response = await fetch(data.signedUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      toast.success(`Downloading ${doc.name}`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download. Please try again.');
    } finally {
      setDownloadingDoc(null);
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'in_review':
        return <Eye className="h-5 w-5 text-purple-500" />;
      default:
        return <Hourglass className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusMessage = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return "We've received your application and it's in the queue.";
      case 'in_review':
        return "Our AI is analyzing your profile and preparing your documents.";
      case 'processing':
        return "Your career pack is being generated. This may take a few minutes.";
      case 'completed':
        return "Your career pack is ready! Download your documents below.";
      default:
        return "";
    }
  };

  const isShareExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return true;
    return new Date(expiresAt) < new Date();
  };

  const getTimeRemaining = (expiresAt: string | null): string => {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const hasDocuments = submission?.shared_documents && 
    submission.shared_documents.length > 0 && 
    !isShareExpired(submission.share_expires_at);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(174,63%,40%)/0.03] via-[hsl(222,47%,30%)/0.03] to-[hsl(38,92%,50%)/0.03] overflow-hidden relative">
      
      {/* Animated background elements */}
      <FloatingElement delay={0} x={30} y={20}>
        <div className="w-48 h-48 rounded-full bg-[hsl(174,63%,40%)/0.1] blur-3xl" />
      </FloatingElement>
      <FloatingElement delay={2} x={-20} y={40}>
        <div className="w-56 h-56 rounded-full bg-[hsl(38,92%,50%)/0.1] blur-3xl" />
      </FloatingElement>
      <FloatingElement delay={4} x={50} y={-30}>
        <div className="w-52 h-52 rounded-full bg-[hsl(222,47%,30%)/0.1] blur-3xl" />
      </FloatingElement>

      {/* Header - Clean & Simple */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </motion.div>
              </Link>

              <Link to="/" className="flex items-center gap-2.5">
                <div className="relative">
                  <img 
                    src="/career-icon.png" 
                    alt="Career Launch Pack" 
                    className="h-7 w-7 object-contain"
                  />
                  <div className="absolute -inset-0.5 bg-primary/20 rounded-full blur-sm -z-10" />
                </div>
                <span className="font-serif text-base font-semibold text-gray-900 dark:text-gray-100">
                  Career Pack
                </span>
              </Link>
            </div>

            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4"
            >
              <Search className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Track Your Application</span>
            </motion.div>
            
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
              Check Your Status
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Enter your reference code to track progress and download your career pack
            </p>
          </div>

          {/* Search Card - Glass morphism */}
          <div className="relative group mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="ref" className="sr-only">Reference Code</Label>
                  <Input
                    id="ref"
                    value={referenceCode}
                    onChange={e => setReferenceCode(e.target.value.toUpperCase())}
                    placeholder="e.g., CLR-XXXXXXXX"
                    className="h-12 text-center font-mono text-sm sm:text-base bg-white/50 dark:bg-gray-800/50 border-0 ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary/50 transition-all"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-[hsl(174,63%,40%)] hover:opacity-90 text-white shadow-lg shadow-primary/25"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Track</span>
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-destructive text-sm mt-3"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {submission && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Status Card */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/5 mb-4">
                  {/* Header with status */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        {getStatusIcon(submission.status)}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <h3 className="font-semibold text-lg">{STATUS_LABELS[submission.status]}</h3>
                      </div>
                    </div>
                    <Badge className={`${STATUS_COLORS[submission.status]} px-3 py-1`}>
                      {STATUS_LABELS[submission.status]}
                    </Badge>
                  </div>

                  {/* Status Message */}
                  <div className="mb-4 p-3 bg-primary/5 rounded-xl">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{getStatusMessage(submission.status)}</span>
                    </p>
                  </div>

                  {/* Progress Steps - Simplified */}
                  <div className="space-y-2 mb-4">
                    {(['pending', 'in_review', 'processing', 'completed'] as SubmissionStatus[]).map((step, index) => {
                      const stepOrder = { pending: 1, in_review: 2, processing: 3, completed: 4 };
                      const currentStepOrder = stepOrder[submission.status];
                      const stepNumber = stepOrder[step];
                      const isComplete = stepNumber < currentStepOrder;
                      const isCurrent = stepNumber === currentStepOrder;

                      return (
                        <div
                          key={step}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            isCurrent ? 'bg-primary/10 ring-1 ring-primary/20' : 
                            isComplete ? 'bg-green-50/50 dark:bg-green-950/20' : 'bg-gray-50/50 dark:bg-gray-800/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                            isComplete ? 'bg-green-500 text-white' :
                            isCurrent ? 'bg-primary text-white' :
                            'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            {isComplete ? '✓' : stepNumber}
                          </div>
                          <span className={`flex-1 text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                            {STATUS_LABELS[step]}
                          </span>
                          {isCurrent && step === 'processing' && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                          )}
                          {isComplete && step !== 'completed' && (
                            <ChevronRight className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Name
                      </p>
                      <p className="font-medium truncate">{submission.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="font-medium truncate">{submission.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted
                      </p>
                      <p className="font-medium">{new Date(submission.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Reference
                      </p>
                      <p className="font-mono text-xs">{submission.reference_code}</p>
                    </div>
                  </div>
                </div>

                {/* Download Section */}
                {submission.status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/5"
                  >
                    {hasDocuments ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-green-500/10">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Ready to Download</h3>
                              <p className="text-xs text-muted-foreground">
                                Your career pack is available
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {getTimeRemaining(submission.share_expires_at)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {submission.shared_documents!.map((doc, i) => (
                            <motion.button
                              key={i}
                              onClick={() => handleDownload(doc)}
                              disabled={downloadingDoc === doc.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-primary/5 transition-all group border border-gray-200 dark:border-gray-700"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024).toFixed(0)} KB • PDF
                                </p>
                              </div>
                              {downloadingDoc === doc.name ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </>
                    ) : submission.shared_documents && isShareExpired(submission.share_expires_at) ? (
                      <div className="text-center space-y-3 py-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <h3 className="font-semibold">Links Expired</h3>
                        <p className="text-sm text-muted-foreground">
                          Download links have expired. Please contact us for a new link.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-3 py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <h3 className="font-semibold">Preparing Your Pack</h3>
                        <p className="text-sm text-muted-foreground">
                          Your career pack is being generated. Check back soon!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Text */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Having trouble? Contact us at{' '}
            <a href="mailto:support@careerpack.com" className="text-primary hover:underline">
              support@careerpack.com
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}