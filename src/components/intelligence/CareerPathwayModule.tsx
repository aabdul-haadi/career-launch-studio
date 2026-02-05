import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Loader2,
  Sparkles,
  GraduationCap,
  Briefcase,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react';

interface CareerPathwayAnalysis {
  profileAssessment: {
    overallScore: number;
    strengthLevel: 'strong' | 'moderate' | 'developing';
    summary: string;
    keyStrengths: string[];
    developmentAreas: string[];
  };
  roleReadiness: Array<{
    role: string;
    readinessScore: number;
    readinessLevel: 'ready' | 'almost-ready' | 'developing' | 'early-stage';
    matchingStrengths: string[];
    gapsToAddress: string[];
    estimatedTimeToReady: string;
  }>;
  careerPathways: Array<{
    pathName: string;
    probability: 'high' | 'medium' | 'low';
    milestones: Array<{
      year: number;
      position: string;
      requirements: string;
    }>;
    salaryProgression: {
      year1: string;
      year3: string;
      year5: string;
    };
  }>;
  competitivePositioning: {
    percentile: number;
    benchmarkComparison: string;
    uniqueAdvantages: string[];
    criticalGaps: string[];
  };
  developmentPlan: {
    immediate: Array<{
      action: string;
      timeframe: string;
      impact: string;
      resources: string;
    }>;
    shortTerm: Array<{
      action: string;
      timeframe: string;
      impact: string;
      resources: string;
    }>;
    longTerm: Array<{
      action: string;
      timeframe: string;
      impact: string;
      resources: string;
    }>;
  };
  certificationRecommendations: Array<{
    name: string;
    provider: string;
    priority: string;
    value: string;
  }>;
}

export function CareerPathwayModule() {
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CareerPathwayAnalysis | null>(null);

  const isProfileComplete = profile.personal.fullName && 
    profile.education.degree && 
    profile.selectedRoles.length > 0;

  const handleAnalyze = async () => {
    if (!isProfileComplete) {
      toast.error('Please complete your profile first');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('career-pathway', {
        body: { profile, targetRoles: profile.selectedRoles },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      toast.success('Career pathway analysis complete');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze career pathway');
    } finally {
      setIsLoading(false);
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'ready': return 'bg-success text-success-foreground';
      case 'almost-ready': return 'bg-teal text-teal-foreground';
      case 'developing': return 'bg-accent text-accent-foreground';
      case 'early-stage': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'strong': return 'text-success';
      case 'moderate': return 'text-accent';
      case 'developing': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getProbabilityColor = (prob: string) => {
    switch (prob) {
      case 'high': return 'border-success bg-success/10';
      case 'medium': return 'border-accent bg-accent/10';
      case 'low': return 'border-muted bg-muted/10';
      default: return 'border-border';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-success/20 text-success';
      case 'medium': return 'bg-accent/20 text-accent-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-teal" />
              Predictive Career Pathway
            </CardTitle>
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading || !isProfileComplete}
              className="btn-generate"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze My Pathway
                </>
              )}
            </Button>
          </div>
          {!isProfileComplete && (
            <p className="text-sm text-muted-foreground mt-2">
              Complete your profile (name, education, target roles) to unlock career pathway analysis.
            </p>
          )}
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Profile Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-teal flex items-center justify-center">
                        <span className="text-3xl font-bold text-teal">
                          {analysis.profileAssessment.overallScore}
                        </span>
                      </div>
                      <Badge 
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${getReadinessColor(analysis.profileAssessment.strengthLevel)}`}
                      >
                        {analysis.profileAssessment.strengthLevel}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                        Profile Assessment
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {analysis.profileAssessment.summary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Competitive Position</span>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-teal">
                      Top {100 - analysis.competitivePositioning.percentile}%
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">of candidates</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Development Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.profileAssessment.keyStrengths.map((strength, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    Development Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.profileAssessment.developmentAreas.map((area, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Role Readiness */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-teal" />
                  Role Readiness Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.roleReadiness.map((role, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground capitalize">{role.role}</h4>
                        <Badge className={getReadinessColor(role.readinessLevel)}>
                          {role.readinessLevel.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Readiness</span>
                          <span className="font-medium text-foreground">{role.readinessScore}%</span>
                        </div>
                        <Progress value={role.readinessScore} className="h-2" />
                      </div>
                      {role.readinessLevel !== 'ready' && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {role.estimatedTimeToReady}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="text-success">✓ </span>
                          <span className="text-muted-foreground">{role.matchingStrengths.slice(0, 2).join(', ')}</span>
                        </div>
                        {role.gapsToAddress.length > 0 && (
                          <div className="text-xs">
                            <span className="text-accent">! </span>
                            <span className="text-muted-foreground">{role.gapsToAddress.slice(0, 2).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Career Pathways */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal" />
                  Predicted Career Pathways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <div className="space-y-6">
                    {analysis.careerPathways.map((pathway, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border-2 ${getProbabilityColor(pathway.probability)}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-foreground">{pathway.pathName}</h4>
                          <Badge variant="outline" className="capitalize">
                            {pathway.probability} probability
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {pathway.milestones.map((milestone, mIdx) => (
                            <div key={mIdx} className="flex items-center">
                              <div className="min-w-[160px] p-3 rounded-lg bg-card border border-border">
                                <div className="text-xs text-teal font-medium mb-1">
                                  Year {milestone.year}
                                </div>
                                <div className="font-medium text-foreground text-sm">
                                  {milestone.position}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {milestone.requirements}
                                </div>
                              </div>
                              {mIdx < pathway.milestones.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted-foreground mx-2 flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-6 mt-4 pt-4 border-t border-border/50">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Year 1: </span>
                            <span className="font-medium text-foreground">{pathway.salaryProgression.year1}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Year 3: </span>
                            <span className="font-medium text-foreground">{pathway.salaryProgression.year3}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Year 5: </span>
                            <span className="font-medium text-foreground">{pathway.salaryProgression.year5}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Development Plan */}
            <Tabs defaultValue="immediate" className="w-full">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-teal" />
                      Development Plan
                    </CardTitle>
                    <TabsList>
                      <TabsTrigger value="immediate">Immediate</TabsTrigger>
                      <TabsTrigger value="shortTerm">Short-term</TabsTrigger>
                      <TabsTrigger value="longTerm">Long-term</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent>
                  {['immediate', 'shortTerm', 'longTerm'].map((period) => (
                    <TabsContent key={period} value={period} className="mt-0">
                      <div className="space-y-3">
                        {analysis.developmentPlan[period as keyof typeof analysis.developmentPlan].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}>
                              {item.impact}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">{item.action}</h5>
                              <p className="text-sm text-muted-foreground mt-1">{item.resources}</p>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.timeframe}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </CardContent>
              </Card>
            </Tabs>

            {/* Certification Recommendations */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal" />
                  Recommended Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.certificationRecommendations.map((cert, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-foreground">{cert.name}</h5>
                        <Badge variant={cert.priority === 'high' ? 'default' : 'secondary'}>
                          {cert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cert.provider}</p>
                      <p className="text-sm text-muted-foreground mt-2">{cert.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!analysis && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Discover Your Career Path
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get AI-powered analysis of your profile against pharmacy role requirements. 
              Receive personalized career pathway predictions, gap analysis, and development recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
