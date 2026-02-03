import { useProfile } from '@/context/ProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuggestibleInput } from '@/components/suggestions';
import { User, Phone, Mail, MapPin, Linkedin } from 'lucide-react';

export function PersonalInfoStep() {
  const { profile, updateProfile } = useProfile();
  const { personal } = profile;

  const handleChange = (field: keyof typeof personal, value: string) => {
    updateProfile('personal', { ...personal, [field]: value });
  };

  return (
    <div className="form-section">
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          Personal Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Basic contact details for your CV header
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-teal" />
            Full Name *
          </Label>
          <SuggestibleInput
            id="fullName"
            fieldName="fullName"
            placeholder="e.g., Ahmed Al-Rashid"
            value={personal.fullName}
            onChange={(value) => handleChange('fullName', value)}
            className="transition-all focus:ring-2 focus:ring-teal/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal" />
              Phone *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+971 50 123 4567"
              value={personal.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ahmed.rashid@email.com"
              value={personal.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal" />
              City *
            </Label>
            <SuggestibleInput
              id="city"
              fieldName="city"
              placeholder="Dubai"
              value={personal.city}
              onChange={(value) => handleChange('city', value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <SuggestibleInput
              id="country"
              fieldName="country"
              placeholder="United Arab Emirates"
              value={personal.country}
              onChange={(value) => handleChange('country', value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-teal" />
            LinkedIn URL (optional)
          </Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/your-profile"
            value={personal.linkedinUrl || ''}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
