import { useProfile } from '@/context/ProfileContext';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RoleType, ROLE_DESCRIPTIONS, RolePreference } from '@/types/student';
import { SuggestibleInput, SuggestibleTextarea } from '@/components/suggestions';
import { Target, Building, FlaskConical, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
  hospital: <Building className="h-5 w-5" />,
  industry: <FlaskConical className="h-5 w-5" />,
  community: <Store className="h-5 w-5" />,
};

export function RoleTargetingStep() {
  const { profile, updateProfile } = useProfile();
  const { selectedRoles, rolePreferences, jobDescription } = profile;

  const toggleRole = (role: RoleType) => {
    let newRoles: RoleType[];
    let newPrefs: RolePreference[];

    if (selectedRoles.includes(role)) {
      newRoles = selectedRoles.filter((r) => r !== role);
      newPrefs = rolePreferences.filter((p) => p.role !== role);
    } else {
      newRoles = [...selectedRoles, role];
      newPrefs = [
        ...rolePreferences,
        { role, interestArea: '', strengths: '', locationPreference: '' },
      ];
    }

    updateProfile('selectedRoles', newRoles);
    updateProfile('rolePreferences', newPrefs);
  };

  const updateRolePreference = (
    role: RoleType,
    field: keyof RolePreference,
    value: string
  ) => {
    updateProfile(
      'rolePreferences',
      rolePreferences.map((pref) =>
        pref.role === role ? { ...pref, [field]: value } : pref
      )
    );
  };

  return (
    <div className="form-section">
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Target className="h-5 w-5 text-teal" />
          Target Roles
        </h3>
        <p className="text-sm text-muted-foreground">
          Select the career paths you're interested in (1-3 roles)
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(Object.keys(ROLE_DESCRIPTIONS) as RoleType[]).map((role) => (
          <label
            key={role}
            className={`
              relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all
              ${
                selectedRoles.includes(role)
                  ? 'border-teal bg-teal/10 ring-2 ring-teal/20'
                  : 'border-border hover:border-teal/50'
              }
            `}
          >
            <Checkbox
              checked={selectedRoles.includes(role)}
              onCheckedChange={() => toggleRole(role)}
              className="absolute top-3 right-3"
            />
            <div
              className={`p-3 rounded-full mb-2 ${
                selectedRoles.includes(role)
                  ? 'bg-teal text-teal-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {ROLE_ICONS[role]}
            </div>
            <span className="font-medium text-center text-sm">
              {ROLE_DESCRIPTIONS[role]}
            </span>
          </label>
        ))}
      </div>

      {/* Role Preferences */}
      <AnimatePresence mode="popLayout">
        {rolePreferences.map((pref) => (
          <motion.div
            key={pref.role}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 border border-border rounded-lg bg-card"
          >
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              {ROLE_ICONS[pref.role]}
              {ROLE_DESCRIPTIONS[pref.role]} Preferences
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Area of Interest / Specialization</Label>
                <SuggestibleInput
                  fieldName="interestArea"
                  placeholder={
                    pref.role === 'hospital'
                      ? 'e.g., Oncology, Critical Care, Pediatrics'
                      : pref.role === 'industry'
                      ? 'e.g., Quality Control, Regulatory Affairs, R&D'
                      : 'e.g., Diabetes care, Vaccination services'
                  }
                  value={pref.interestArea}
                  onChange={(value) =>
                    updateRolePreference(pref.role, 'interestArea', value)
                  }
                  context={{ role: pref.role }}
                />
              </div>

              <div className="space-y-2">
                <Label>Key Strengths to Highlight</Label>
                <SuggestibleTextarea
                  fieldName="strengths"
                  placeholder="What makes you a strong candidate for this role?"
                  value={pref.strengths}
                  onChange={(value) =>
                    updateRolePreference(pref.role, 'strengths', value)
                  }
                  context={{ role: pref.role, interestArea: pref.interestArea }}
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label>Location Preference (optional)</Label>
                <SuggestibleInput
                  fieldName="city"
                  placeholder="e.g., Dubai, Abu Dhabi, Remote"
                  value={pref.locationPreference || ''}
                  onChange={(value) =>
                    updateRolePreference(pref.role, 'locationPreference', value)
                  }
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {selectedRoles.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          Select at least one target role above to customize your outputs
        </p>
      )}

      {/* Job Description */}
      <div className="mt-6 space-y-3">
        <Label className="text-base font-medium">
          Job Description (optional)
        </Label>
        <p className="text-sm text-muted-foreground">
          Paste a specific job posting to tailor your CV and cover letter
        </p>
        <SuggestibleTextarea
          fieldName="jobDescription"
          placeholder="Paste the full job description here..."
          value={jobDescription || ''}
          onChange={(value) => updateProfile('jobDescription', value)}
          className="h-40 font-mono text-sm"
        />
      </div>
    </div>
  );
}
