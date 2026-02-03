import { useProfile } from '@/context/ProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Certification, Activity } from '@/types/student';
import { Plus, Trash2, Award, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CertificationsStep() {
  const { profile, updateProfile } = useProfile();
  const { certifications, activities } = profile;

  // Certifications handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: crypto.randomUUID(),
      name: '',
      provider: '',
      year: new Date().getFullYear().toString(),
    };
    updateProfile('certifications', [...certifications, newCert]);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    updateProfile(
      'certifications',
      certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
  };

  const removeCertification = (id: string) => {
    updateProfile(
      'certifications',
      certifications.filter((cert) => cert.id !== id)
    );
  };

  // Activities handlers
  const addActivity = () => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      description: '',
      type: 'volunteering',
    };
    updateProfile('activities', [...activities, newActivity]);
  };

  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    updateProfile(
      'activities',
      activities.map((act) =>
        act.id === id ? { ...act, [field]: value } : act
      )
    );
  };

  const removeActivity = (id: string) => {
    updateProfile(
      'activities',
      activities.filter((act) => act.id !== id)
    );
  };

  return (
    <div className="form-section">
      {/* Certifications Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <Award className="h-5 w-5 text-teal" />
            Certifications & Courses
          </h3>
          <p className="text-sm text-muted-foreground">
            Professional certifications, online courses, or training
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-4 p-4 border border-border rounded-lg bg-muted/30"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Certification {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(cert.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <Label>Course Name</Label>
                  <Input
                    placeholder="e.g., Clinical Pharmacy Certificate"
                    value={cert.name}
                    onChange={(e) =>
                      updateCertification(cert.id, 'name', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    placeholder="2024"
                    value={cert.year}
                    onChange={(e) =>
                      updateCertification(cert.id, 'year', e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Label>Provider</Label>
                <Input
                  placeholder="e.g., Coursera, ASHP, University"
                  value={cert.provider}
                  onChange={(e) =>
                    updateCertification(cert.id, 'provider', e.target.value)
                  }
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          type="button"
          variant="outline"
          onClick={addCertification}
          className="w-full border-dashed border-2 hover:border-teal hover:bg-teal/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {/* Activities Section */}
      <div>
        <div className="mb-4">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal" />
            Activities & Leadership
          </h3>
          <p className="text-sm text-muted-foreground">
            Volunteering, society roles, presentations, or leadership activities
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-4 p-4 border border-border rounded-lg bg-muted/30"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Activity {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeActivity(activity.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={activity.type}
                    onValueChange={(value) =>
                      updateActivity(activity.id, 'type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volunteering">Volunteering</SelectItem>
                      <SelectItem value="society">Society / Club</SelectItem>
                      <SelectItem value="presentation">
                        Poster / Presentation
                      </SelectItem>
                      <SelectItem value="leadership">
                        Leadership Role
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your role and contributions..."
                    value={activity.description}
                    onChange={(e) =>
                      updateActivity(activity.id, 'description', e.target.value)
                    }
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
          onClick={addActivity}
          className="w-full border-dashed border-2 hover:border-teal hover:bg-teal/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>
    </div>
  );
}
