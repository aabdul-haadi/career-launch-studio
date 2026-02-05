import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Building2, 
  DollarSign, 
  GraduationCap,
  Sparkles,
  MapPin,
  Briefcase,
  Loader2,
  Globe,
  Users
} from 'lucide-react';
import { RoleType, ROLE_DESCRIPTIONS } from '@/types/student';

interface JobMarketAnalysis {
  marketOverview: {
    demandLevel: 'high' | 'moderate' | 'low';
    growthTrend: 'growing' | 'stable' | 'declining';
    openPositions: string;
    summary: string;
  };
  salaryBenchmarks: {
    currency: string;
    entryLevel: { min: number; max: number };
    midLevel: { min: number; max: number };
    seniorLevel: { min: number; max: number };
  };
  topEmployers: Array<{
    name: string;
    type: string;
    positions: string;
  }>;
  requiredQualifications: Array<{
    name: string;
    importance: 'required' | 'preferred';
    description: string;
  }>;
  emergingTrends: Array<{
    trend: string;
    impact: string;
    timeframe: string;
  }>;
  competitiveBenchmarks: {
    topSkills: string[];
    differentiators: string[];
    gapAnalysis: string;
  };
}

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'India', 'Singapore', 'UAE', 'Saudi Arabia',
  'Pakistan', 'Egypt', 'South Africa', 'Nigeria', 'Malaysia',
  'New Zealand', 'Ireland', 'Netherlands', 'Sweden', 'Switzerland'
];

export function JobMarketModule() {
  const { profile } = useProfile();
  const [country, setCountry] = useState(profile.personal.country || '');
  const [city, setCity] = useState(profile.personal.city || '');
  const [roleType, setRoleType] = useState<RoleType>(profile.selectedRoles[0] || 'hospital');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobMarketAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!country) {
      toast.error('Please select a country');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('job-market-analysis', {
        body: { country, city, roleType, profile },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      toast.success('Market analysis complete');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze market');
    } finally {
      setIsLoading(false);
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-success text-success-foreground';
      case 'moderate': return 'bg-accent text-accent-foreground';
      case 'low': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatSalary = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-teal" />
            Market Intelligence Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City (Optional)</Label>
              <Input 
                placeholder="e.g., Toronto, London" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role Type</Label>
              <Select value={roleType} onValueChange={(v) => setRoleType(v as RoleType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_DESCRIPTIONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading || !country}
                className="w-full btn-generate"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Market
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Demand Level</span>
                    <Badge className={getDemandColor(analysis.marketOverview.demandLevel)}>
                      {analysis.marketOverview.demandLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(analysis.marketOverview.growthTrend)}
                    <span className="text-sm capitalize">{analysis.marketOverview.growthTrend}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-teal" />
                    <span className="text-sm text-muted-foreground">Open Positions</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {analysis.marketOverview.openPositions}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-teal" />
                    <span className="text-sm text-muted-foreground">Location</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {city ? `${city}, ${country}` : country}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {analysis.marketOverview.summary}
                </p>
              </CardContent>
            </Card>

            {/* Detailed Tabs */}
            <Tabs defaultValue="salary" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="salary" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Salary</span>
                </TabsTrigger>
                <TabsTrigger value="employers" className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Employers</span>
                </TabsTrigger>
                <TabsTrigger value="qualifications" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Qualifications</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Trends</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="salary" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['entryLevel', 'midLevel', 'seniorLevel'].map((level) => {
                        const data = analysis.salaryBenchmarks[level as keyof typeof analysis.salaryBenchmarks];
                        if (typeof data !== 'object') return null;
                        return (
                          <div key={level} className="space-y-2">
                            <h4 className="font-medium capitalize text-foreground">
                              {level.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div className="text-2xl font-bold text-teal">
                              {formatSalary((data as any).min, analysis.salaryBenchmarks.currency)} - {formatSalary((data as any).max, analysis.salaryBenchmarks.currency)}
                            </div>
                            <p className="text-sm text-muted-foreground">per year</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employers" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {analysis.topEmployers.map((employer, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-teal" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{employer.name}</h4>
                              <p className="text-sm text-muted-foreground">{employer.type}</p>
                              <p className="text-sm text-muted-foreground mt-1">{employer.positions}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qualifications" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {analysis.requiredQualifications.map((qual, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 rounded-lg border border-border">
                          <Badge variant={qual.importance === 'required' ? 'default' : 'secondary'}>
                            {qual.importance}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{qual.name}</h4>
                            <p className="text-sm text-muted-foreground">{qual.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4">
                      {analysis.emergingTrends.map((trend, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-teal/5 to-transparent border border-teal/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{trend.trend}</h4>
                            <Badge variant="outline">{trend.timeframe}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{trend.impact}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-6">
                      <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4 text-teal" />
                        Competitive Benchmarks
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Top Skills in Demand</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.competitiveBenchmarks.topSkills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">What Sets Top Candidates Apart</p>
                          <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                            {analysis.competitiveBenchmarks.differentiators.map((diff, idx) => (
                              <li key={idx}>{diff}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                          <p className="text-sm font-medium text-accent-foreground">Gap Analysis</p>
                          <p className="text-sm text-muted-foreground">{analysis.competitiveBenchmarks.gapAnalysis}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!analysis && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Get Market Intelligence
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select your target location and role type to receive comprehensive pharmacy job market analysis with salary benchmarks, top employers, and competitive insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
