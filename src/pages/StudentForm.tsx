import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Pill, ArrowLeft, ArrowRight, Send, Plus, Trash2, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { COURSEWORK_OPTIONS, HARD_SKILLS_OPTIONS, SOFT_SKILLS_OPTIONS, FYP_TOOLS_OPTIONS } from '@/types/student';
import { AICoachPanel } from '@/components/student-form/AICoachPanel';

const STEPS = [
  'Personal Info',
  'Education',
  'Experience',
  'FYP/Research',
  'Skills',
  'Certifications',
  'Target Roles',
];

interface ExperienceEntry {
  id: string;
  organization: string;
  department: string;
  type: 'internship' | 'rotation' | 'part-time';
  start_date: string;
  end_date: string;
  responsibilities: string;
  achievements: string;
}

interface CertificationEntry {
  id: string;
  name: string;
  provider: string;
  year: string;
}

export default function StudentForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAICoach, setShowAICoach] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    // Personal
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    nationality: '',
    // Education
    university: '',
    degree: 'PharmD',
    graduation_year: '',
    gpa: '',
    coursework: [] as string[],
    // Experience
    experience: [] as ExperienceEntry[],
    // FYP
    fyp_title: '',
    fyp_supervisor: '',
    fyp_objectives: '',
    fyp_methods: '',
    fyp_tools: '',
    fyp_outcomes: '',
    // Skills
    technical_skills: [] as string[],
    soft_skills: [] as string[],
    languages: [] as { language: string; proficiency: string }[],
    // Certifications
    certifications: [] as CertificationEntry[],
    // Roles
    selected_roles: [] as string[],
    job_description: '',
  });

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    const newEntry: ExperienceEntry = {
      id: crypto.randomUUID(),
      organization: '',
      department: '',
      type: 'internship',
      start_date: '',
      end_date: '',
      responsibilities: '',
      achievements: '',
    };
    updateField('experience', [...formData.experience, newEntry]);
  };

  const updateExperience = (id: string, field: string, value: string) => {
    updateField(
      'experience',
      formData.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: string) => {
    updateField('experience', formData.experience.filter(exp => exp.id !== id));
  };

  const addCertification = () => {
    const newCert: CertificationEntry = {
      id: crypto.randomUUID(),
      name: '',
      provider: '',
      year: '',
    };
    updateField('certifications', [...formData.certifications, newCert]);
  };

  const updateCertification = (id: string, field: string, value: string) => {
    updateField(
      'certifications',
      formData.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
  };

  const removeCertification = (id: string) => {
    updateField('certifications', formData.certifications.filter(cert => cert.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email || !formData.university || !formData.degree) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Cast to unknown first to bypass strict typing with the generated types
      const insertPayload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null,
        nationality: formData.nationality || null,
        university: formData.university,
        degree: formData.degree,
        graduation_year: formData.graduation_year || null,
        gpa: formData.gpa || null,
        coursework: formData.coursework as unknown,
        experience: formData.experience as unknown,
        fyp_title: formData.fyp_title || null,
        fyp_supervisor: formData.fyp_supervisor || null,
        fyp_objectives: formData.fyp_objectives || null,
        fyp_methods: formData.fyp_methods || null,
        fyp_tools: formData.fyp_tools || null,
        fyp_outcomes: formData.fyp_outcomes || null,
        technical_skills: formData.technical_skills as unknown,
        soft_skills: formData.soft_skills as unknown,
        languages: formData.languages as unknown,
        certifications: formData.certifications as unknown,
        selected_roles: formData.selected_roles as unknown,
        job_description: formData.job_description || null,
      };

      const { data, error } = await supabase
        .from('student_submissions')
        .insert(insertPayload as never)
        .select('reference_code')
        .single();

      if (error) throw error;

      toast.success('Application submitted successfully!');
      navigate(`/status?ref=${data.reference_code}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={e => updateField('full_name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={e => updateField('nationality', e.target.value)}
                  placeholder="Canadian"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={e => updateField('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
          </div>
        );

      case 1: // Education
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={e => updateField('university', e.target.value)}
                  placeholder="University of Toronto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree *</Label>
                <Select value={formData.degree} onValueChange={v => updateField('degree', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PharmD">PharmD</SelectItem>
                    <SelectItem value="BPharm">B.Pharm</SelectItem>
                    <SelectItem value="MPharm">M.Pharm</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduation_year">Graduation Year</Label>
                <Input
                  id="graduation_year"
                  value={formData.graduation_year}
                  onChange={e => updateField('graduation_year', e.target.value)}
                  placeholder="2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  value={formData.gpa}
                  onChange={e => updateField('gpa', e.target.value)}
                  placeholder="3.8/4.0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Relevant Coursework</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {COURSEWORK_OPTIONS.map(course => (
                  <div key={course} className="flex items-center gap-2">
                    <Checkbox
                      id={course}
                      checked={formData.coursework.includes(course)}
                      onCheckedChange={checked => {
                        if (checked) {
                          updateField('coursework', [...formData.coursework, course]);
                        } else {
                          updateField('coursework', formData.coursework.filter(c => c !== course));
                        }
                      }}
                    />
                    <label htmlFor={course} className="text-sm cursor-pointer">
                      {course}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Experience
        return (
          <div className="space-y-4">
            {formData.experience.map((exp, index) => (
              <Card key={exp.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive"
                  onClick={() => removeExperience(exp.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Experience {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Organization</Label>
                      <Input
                        value={exp.organization}
                        onChange={e => updateExperience(exp.id, 'organization', e.target.value)}
                        placeholder="Hospital/Company Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Department</Label>
                      <Input
                        value={exp.department}
                        onChange={e => updateExperience(exp.id, 'department', e.target.value)}
                        placeholder="Pharmacy Department"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select value={exp.type} onValueChange={v => updateExperience(exp.id, 'type', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="rotation">Clinical Rotation</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Start Date</Label>
                      <Input
                        type="month"
                        value={exp.start_date}
                        onChange={e => updateExperience(exp.id, 'start_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={exp.end_date}
                        onChange={e => updateExperience(exp.id, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Responsibilities</Label>
                    <Textarea
                      value={exp.responsibilities}
                      onChange={e => updateExperience(exp.id, 'responsibilities', e.target.value)}
                      placeholder="Describe your key responsibilities..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Achievements</Label>
                    <Textarea
                      value={exp.achievements}
                      onChange={e => updateExperience(exp.id, 'achievements', e.target.value)}
                      placeholder="Notable achievements or outcomes..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addExperience} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        );

      case 3: // FYP/Research
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fyp_title">Project Title</Label>
                <Input
                  id="fyp_title"
                  value={formData.fyp_title}
                  onChange={e => updateField('fyp_title', e.target.value)}
                  placeholder="Evaluation of..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fyp_supervisor">Supervisor</Label>
                <Input
                  id="fyp_supervisor"
                  value={formData.fyp_supervisor}
                  onChange={e => updateField('fyp_supervisor', e.target.value)}
                  placeholder="Dr. Smith"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fyp_objectives">Objectives</Label>
              <Textarea
                id="fyp_objectives"
                value={formData.fyp_objectives}
                onChange={e => updateField('fyp_objectives', e.target.value)}
                placeholder="What were the main objectives of your research?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fyp_methods">Methods</Label>
              <Textarea
                id="fyp_methods"
                value={formData.fyp_methods}
                onChange={e => updateField('fyp_methods', e.target.value)}
                placeholder="Describe your research methodology..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fyp_tools">Tools & Software</Label>
              <Input
                id="fyp_tools"
                value={formData.fyp_tools}
                onChange={e => updateField('fyp_tools', e.target.value)}
                placeholder="SPSS, HPLC, GraphPad Prism..."
              />
              <p className="text-xs text-muted-foreground">
                Common tools: {FYP_TOOLS_OPTIONS.slice(0, 5).join(', ')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fyp_outcomes">Key Findings/Outcomes</Label>
              <Textarea
                id="fyp_outcomes"
                value={formData.fyp_outcomes}
                onChange={e => updateField('fyp_outcomes', e.target.value)}
                placeholder="What were the main findings or outcomes?"
                rows={3}
              />
            </div>
          </div>
        );

      case 4: // Skills
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Technical Skills</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {HARD_SKILLS_OPTIONS.map(skill => (
                  <div key={skill} className="flex items-center gap-2">
                    <Checkbox
                      id={`tech-${skill}`}
                      checked={formData.technical_skills.includes(skill)}
                      onCheckedChange={checked => {
                        if (checked) {
                          updateField('technical_skills', [...formData.technical_skills, skill]);
                        } else {
                          updateField('technical_skills', formData.technical_skills.filter(s => s !== skill));
                        }
                      }}
                    />
                    <label htmlFor={`tech-${skill}`} className="text-sm cursor-pointer">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Soft Skills</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {SOFT_SKILLS_OPTIONS.map(skill => (
                  <div key={skill} className="flex items-center gap-2">
                    <Checkbox
                      id={`soft-${skill}`}
                      checked={formData.soft_skills.includes(skill)}
                      onCheckedChange={checked => {
                        if (checked) {
                          updateField('soft_skills', [...formData.soft_skills, skill]);
                        } else {
                          updateField('soft_skills', formData.soft_skills.filter(s => s !== skill));
                        }
                      }}
                    />
                    <label htmlFor={`soft-${skill}`} className="text-sm cursor-pointer">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Certifications
        return (
          <div className="space-y-4">
            {formData.certifications.map((cert, index) => (
              <Card key={cert.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive"
                  onClick={() => removeCertification(cert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>Certification Name</Label>
                      <Input
                        value={cert.name}
                        onChange={e => updateCertification(cert.id, 'name', e.target.value)}
                        placeholder="BLS, ACLS, etc."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Provider</Label>
                      <Input
                        value={cert.provider}
                        onChange={e => updateCertification(cert.id, 'provider', e.target.value)}
                        placeholder="American Heart Association"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Year</Label>
                      <Input
                        value={cert.year}
                        onChange={e => updateCertification(cert.id, 'year', e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addCertification} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
            {formData.certifications.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                No certifications added yet. This is optional.
              </p>
            )}
          </div>
        );

      case 6: // Target Roles
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target Career Paths</Label>
              <div className="space-y-3">
                {[
                  { value: 'hospital', label: 'Hospital/Clinical Pharmacy', desc: 'Inpatient care, medication therapy management' },
                  { value: 'industry', label: 'Pharmaceutical Industry', desc: 'QA/QC, regulatory affairs, R&D' },
                  { value: 'community', label: 'Community/Retail Pharmacy', desc: 'Patient counseling, dispensing, wellness' },
                ].map(role => (
                  <div key={role.value} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={role.value}
                      checked={formData.selected_roles.includes(role.value)}
                      onCheckedChange={checked => {
                        if (checked) {
                          updateField('selected_roles', [...formData.selected_roles, role.value]);
                        } else {
                          updateField('selected_roles', formData.selected_roles.filter(r => r !== role.value));
                        }
                      }}
                    />
                    <div>
                      <label htmlFor={role.value} className="font-medium cursor-pointer">
                        {role.label}
                      </label>
                      <p className="text-sm text-muted-foreground">{role.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_description">Target Job Description (Optional)</Label>
              <Textarea
                id="job_description"
                value={formData.job_description}
                onChange={e => updateField('job_description', e.target.value)}
                placeholder="Paste a specific job description you're targeting..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                This helps us tailor your CV and cover letter to the specific role.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Form Area */}
      <div className={`flex-1 transition-all duration-300 ${showAICoach ? 'lg:pr-[400px]' : ''}`}>
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
  <div className="container mx-auto px-4 py-3">
    <div className="flex items-center justify-between">
      {/* Left side - Back button + Logo */}
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

      {/* Right side - AI Coach button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAICoach(!showAICoach)}
        className="gap-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-sm px-3 py-1.5 h-auto"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">AI Coach</span>AI Coach
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </Button>
    </div>
  </div>
</header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep + 1} of {STEPS.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {STEPS.map((step, index) => (
                <button
                  key={step}
                  onClick={() => setCurrentStep(index)}
                  className={`text-xs hidden md:block ${
                    index === currentStep
                      ? 'text-primary font-medium'
                      : index < currentStep
                      ? 'text-teal'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">{STEPS[currentStep]}</CardTitle>
                <CardDescription>
                  {currentStep === 0 && 'Enter your contact information'}
                  {currentStep === 1 && 'Tell us about your pharmacy education'}
                  {currentStep === 2 && 'Add your internships, rotations, and work experience'}
                  {currentStep === 3 && 'Describe your final year project or research'}
                  {currentStep === 4 && 'Select your technical and soft skills'}
                  {currentStep === 5 && 'Add any professional certifications'}
                  {currentStep === 6 && 'Choose your target career paths'}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderStep()}</CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-generate"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                <Send className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* AI Coach Side Panel */}
      <AICoachPanel 
        isOpen={showAICoach} 
        onClose={() => setShowAICoach(false)}
        currentStep={STEPS[currentStep]}
        formData={formData}
      />
    </div>
  );
}
