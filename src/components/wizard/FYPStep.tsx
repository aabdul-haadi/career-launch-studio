import { useProfile } from '@/context/ProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FYP_TOOLS_OPTIONS } from '@/types/student';
import { FileText, Target, FlaskConical, Wrench, Trophy } from 'lucide-react';

export function FYPStep() {
  const { profile, updateProfile } = useProfile();
  const { fyp } = profile;

  const handleChange = (field: keyof typeof fyp, value: string | string[]) => {
    updateProfile('fyp', { ...fyp, [field]: value });
  };

  const toggleTool = (tool: string) => {
    const current = fyp.tools || [];
    const updated = current.includes(tool)
      ? current.filter((t) => t !== tool)
      : [...current, tool];
    handleChange('tools', updated);
  };

  return (
    <div className="form-section">
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          Final Year Project / Research
        </h3>
        <p className="text-sm text-muted-foreground">
          Details about your capstone project or research work
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal" />
            Project Title / Topic
          </Label>
          <Input
            id="title"
            placeholder="e.g., Evaluation of Community Pharmacist Interventions in Diabetes Management"
            value={fyp.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives" className="flex items-center gap-2">
            <Target className="h-4 w-4 text-teal" />
            Objectives
          </Label>
          <Textarea
            id="objectives"
            placeholder="What are the main objectives of your project?"
            value={fyp.objectives}
            onChange={(e) => handleChange('objectives', e.target.value)}
            className="h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="methods" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-teal" />
            Methods / Study Design
          </Label>
          <Textarea
            id="methods"
            placeholder="e.g., Cross-sectional study, systematic review, laboratory analysis..."
            value={fyp.methods}
            onChange={(e) => handleChange('methods', e.target.value)}
            className="h-24"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-teal" />
            Tools & Software Used
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FYP_TOOLS_OPTIONS.map((tool) => (
              <label
                key={tool}
                className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={fyp.tools?.includes(tool)}
                  onCheckedChange={() => toggleTool(tool)}
                />
                <span className="text-sm">{tool}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outcomes" className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-teal" />
            Key Outcomes / Findings (if available)
          </Label>
          <Textarea
            id="outcomes"
            placeholder="Any preliminary findings, results, or expected outcomes..."
            value={fyp.outcomes || ''}
            onChange={(e) => handleChange('outcomes', e.target.value)}
            className="h-24"
          />
        </div>
      </div>
    </div>
  );
}
