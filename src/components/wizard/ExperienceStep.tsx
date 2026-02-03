import { useProfile } from '@/context/ProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SuggestibleInput, SuggestibleTextarea } from '@/components/suggestions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExperienceEntry } from '@/types/student';
import { Plus, Trash2, Building2, Calendar, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ExperienceStep() {
  const { profile, updateProfile } = useProfile();
  const { experience } = profile;

  const addExperience = () => {
    const newEntry: ExperienceEntry = {
      id: crypto.randomUUID(),
      organization: '',
      department: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
      achievements: '',
      type: 'internship',
    };
    updateProfile('experience', [...experience, newEntry]);
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    updateProfile(
      'experience',
      experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: string) => {
    updateProfile(
      'experience',
      experience.filter((exp) => exp.id !== id)
    );
  };

  return (
    <div className="form-section">
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          Experience
        </h3>
        <p className="text-sm text-muted-foreground">
          Internships, rotations, and relevant work experience
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {experience.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-6 p-4 border border-border rounded-lg bg-muted/30"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-foreground">
                Experience {index + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(exp.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-teal" />
                  Type
                </Label>
                <Select
                  value={exp.type}
                  onValueChange={(value) => updateExperience(exp.id, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="rotation">Clinical Rotation</SelectItem>
                    <SelectItem value="part-time">Part-time Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-teal" />
                    Organization
                  </Label>
                  <SuggestibleInput
                    fieldName="organization"
                    placeholder="e.g., Cleveland Clinic Abu Dhabi"
                    value={exp.organization}
                    onChange={(value) =>
                      updateExperience(exp.id, 'organization', value)
                    }
                    context={{ type: exp.type }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <SuggestibleInput
                    fieldName="department"
                    placeholder="e.g., Inpatient Pharmacy"
                    value={exp.department}
                    onChange={(value) =>
                      updateExperience(exp.id, 'department', value)
                    }
                    context={{ organization: exp.organization, type: exp.type }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal" />
                    Start Date
                  </Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, 'startDate', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(exp.id, 'endDate', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Responsibilities</Label>
                <SuggestibleTextarea
                  fieldName="responsibilities"
                  placeholder="Describe your key responsibilities..."
                  value={exp.responsibilities}
                  onChange={(value) =>
                    updateExperience(exp.id, 'responsibilities', value)
                  }
                  context={{
                    organization: exp.organization,
                    department: exp.department,
                    type: exp.type,
                  }}
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label>Achievements (optional)</Label>
                <SuggestibleTextarea
                  fieldName="achievements"
                  placeholder="Any notable achievements or outcomes..."
                  value={exp.achievements}
                  onChange={(value) =>
                    updateExperience(exp.id, 'achievements', value)
                  }
                  context={{
                    organization: exp.organization,
                    department: exp.department,
                    type: exp.type,
                    responsibilities: exp.responsibilities,
                  }}
                  className="h-20"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        type="button"
        variant="outline"
        onClick={addExperience}
        className="w-full border-dashed border-2 hover:border-teal hover:bg-teal/5"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>

      {experience.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          No experience entries yet. Click above to add your internships or rotations.
        </p>
      )}
    </div>
  );
}
