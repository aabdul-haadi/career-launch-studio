import { useProfile } from '@/context/ProfileContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  HARD_SKILLS_OPTIONS,
  SOFT_SKILLS_OPTIONS,
  TOOLS_OPTIONS,
} from '@/types/student';
import { Wrench, Heart, Monitor } from 'lucide-react';

export function SkillsStep() {
  const { profile, updateProfile } = useProfile();
  const { skills } = profile;

  const toggleSkill = (
    category: 'hardSkills' | 'softSkills' | 'tools',
    skill: string
  ) => {
    const current = skills[category] || [];
    const updated = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];
    updateProfile('skills', { ...skills, [category]: updated });
  };

  const handleCustomChange = (
    field: 'customHardSkills' | 'customSoftSkills' | 'customTools',
    value: string
  ) => {
    updateProfile('skills', { ...skills, [field]: value });
  };

  return (
    <div className="form-section">
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          Skills
        </h3>
        <p className="text-sm text-muted-foreground">
          Select your technical and interpersonal skills
        </p>
      </div>

      <div className="space-y-6">
        {/* Hard Skills */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Wrench className="h-4 w-4 text-teal" />
            Technical / Hard Skills
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {HARD_SKILLS_OPTIONS.map((skill) => (
              <label
                key={skill}
                className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors text-sm"
              >
                <Checkbox
                  checked={skills.hardSkills?.includes(skill)}
                  onCheckedChange={() => toggleSkill('hardSkills', skill)}
                />
                <span>{skill}</span>
              </label>
            ))}
          </div>
          <Textarea
            placeholder="Additional technical skills..."
            value={skills.customHardSkills || ''}
            onChange={(e) => handleCustomChange('customHardSkills', e.target.value)}
            className="h-16 text-sm"
          />
        </div>

        {/* Tools */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Monitor className="h-4 w-4 text-teal" />
            Software & Tools
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS_OPTIONS.map((tool) => (
              <label
                key={tool}
                className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors text-sm"
              >
                <Checkbox
                  checked={skills.tools?.includes(tool)}
                  onCheckedChange={() => toggleSkill('tools', tool)}
                />
                <span>{tool}</span>
              </label>
            ))}
          </div>
          <Textarea
            placeholder="Additional software or tools..."
            value={skills.customTools || ''}
            onChange={(e) => handleCustomChange('customTools', e.target.value)}
            className="h-16 text-sm"
          />
        </div>

        {/* Soft Skills */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Heart className="h-4 w-4 text-teal" />
            Soft Skills
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SOFT_SKILLS_OPTIONS.map((skill) => (
              <label
                key={skill}
                className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors text-sm"
              >
                <Checkbox
                  checked={skills.softSkills?.includes(skill)}
                  onCheckedChange={() => toggleSkill('softSkills', skill)}
                />
                <span>{skill}</span>
              </label>
            ))}
          </div>
          <Textarea
            placeholder="Additional interpersonal skills..."
            value={skills.customSoftSkills || ''}
            onChange={(e) => handleCustomChange('customSoftSkills', e.target.value)}
            className="h-16 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
