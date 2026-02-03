import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Copy, Edit2, Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';

export function LinkedInOutput() {
  const { generatedOutputs, editedOutputs, setEditedOutputs, profile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<typeof generatedOutputs.linkedin | null>(null);

  if (!generatedOutputs) return null;

  const linkedin = editedOutputs.linkedin
    ? { ...generatedOutputs.linkedin, ...editedOutputs.linkedin }
    : generatedOutputs.linkedin;

  const handleEdit = () => {
    setEditContent({ ...linkedin });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editContent) {
      setEditedOutputs({ ...editedOutputs, linkedin: editContent });
    }
    setIsEditing(false);
    toast.success('LinkedIn content updated');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadAsTxt = () => {
    const content = `LINKEDIN PROFILE OPTIMIZATION
============================

HEADLINE (${linkedin.headline.length}/220 characters)
${linkedin.headline}

ABOUT (${linkedin.about.length}/2000 characters)
${linkedin.about}

EXPERIENCE BULLETS
${linkedin.experienceBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

RECOMMENDED SKILLS
${linkedin.skills.join(', ')}

${linkedin.networkingMessage ? `NETWORKING MESSAGE TEMPLATE\n${linkedin.networkingMessage}\n` : ''}
${linkedin.openToWork ? `"OPEN TO WORK" MESSAGE\n${linkedin.openToWork}` : ''}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.personal.fullName.replace(/\s+/g, '_')}_LinkedIn.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('LinkedIn content downloaded');
  };

  const current = isEditing ? editContent! : linkedin;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-teal" />
          LinkedIn Optimization
        </h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" className="btn-export" onClick={downloadAsTxt}>
                <Download className="h-4 w-4 mr-1" />
                TXT
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Headline</Label>
          <span className="text-xs text-muted-foreground">
            {current.headline.length}/220 characters
          </span>
        </div>
        {isEditing ? (
          <Input
            value={current.headline}
            onChange={(e) =>
              setEditContent({ ...current, headline: e.target.value })
            }
            maxLength={220}
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md text-sm">
              {current.headline}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(current.headline, 'Headline')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* About */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-medium">About</Label>
          <span className="text-xs text-muted-foreground">
            {current.about.length}/2000 characters
          </span>
        </div>
        {isEditing ? (
          <Textarea
            value={current.about}
            onChange={(e) =>
              setEditContent({ ...current, about: e.target.value })
            }
            className="min-h-[200px]"
            maxLength={2000}
          />
        ) : (
          <div className="flex items-start gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
              {current.about}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(current.about, 'About section')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label className="font-medium">Recommended Skills ({current.skills.length})</Label>
        <div className="flex flex-wrap gap-2">
          {current.skills.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(current.skills.join(', '), 'Skills list')}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy All Skills
          </Button>
        )}
      </div>

      {/* Experience Bullets */}
      <div className="space-y-2">
        <Label className="font-medium">Experience Bullets</Label>
        <div className="space-y-2">
          {current.experienceBullets.map((bullet, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 p-2 bg-muted rounded-md text-sm">
                • {bullet}
              </div>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(bullet, 'Bullet')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Networking Message */}
      {current.networkingMessage && (
        <div className="space-y-2">
          <Label className="font-medium">Networking Message Template</Label>
          <div className="flex items-start gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
              {current.networkingMessage}
            </div>
            {!isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyToClipboard(current.networkingMessage!, 'Networking message')
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
