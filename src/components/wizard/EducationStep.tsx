import { useProfile } from '@/context/ProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COURSEWORK_OPTIONS } from '@/types/student';
import { GraduationCap, Building, Calendar, Award, BookOpen } from 'lucide-react';

export function EducationStep() {
  const { profile, updateProfile } = useProfile();
  const { education } = profile;

  const handleChange = (field: keyof typeof education, value: string | string[]) => {
    updateProfile('education', { ...education, [field]: value });
  };

  const toggleCoursework = (course: string) => {
    const current = education.coursework || [];
    const updated = current.includes(course)
      ? current.filter((c) => c !== course)
      : [...current, course];
    handleChange('coursework', updated);
  };

  return (
    <div className="form-section">
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          Education
        </h3>
        <p className="text-sm text-muted-foreground">
          Your pharmacy degree and academic background
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-teal" />
            Degree *
          </Label>
          <Select
            value={education.degree}
            onValueChange={(value) => handleChange('degree', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PharmD">Doctor of Pharmacy (PharmD)</SelectItem>
              <SelectItem value="BPharm">Bachelor of Pharmacy (BPharm)</SelectItem>
              <SelectItem value="MPharm">Master of Pharmacy (MPharm)</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="university" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-teal" />
            University *
          </Label>
          <Input
            id="university"
            placeholder="e.g., University of Sharjah"
            value={education.university}
            onChange={(e) => handleChange('university', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="graduationDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal" />
              Expected Graduation *
            </Label>
            <Input
              id="graduationDate"
              type="month"
              value={education.graduationDate}
              onChange={(e) => handleChange('graduationDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpa" className="flex items-center gap-2">
              <Award className="h-4 w-4 text-teal" />
              GPA (optional)
            </Label>
            <Input
              id="gpa"
              placeholder="e.g., 3.75/4.0"
              value={education.gpa || ''}
              onChange={(e) => handleChange('gpa', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal" />
            Relevant Coursework
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {COURSEWORK_OPTIONS.map((course) => (
              <label
                key={course}
                className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={education.coursework?.includes(course)}
                  onCheckedChange={() => toggleCoursework(course)}
                />
                <span className="text-sm">{course}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customCoursework">Additional Coursework</Label>
          <Textarea
            id="customCoursework"
            placeholder="Any additional relevant courses not listed above..."
            value={education.customCoursework || ''}
            onChange={(e) => handleChange('customCoursework', e.target.value)}
            className="h-20"
          />
        </div>
      </div>
    </div>
  );
}
