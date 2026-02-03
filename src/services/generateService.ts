import { supabase } from '@/integrations/supabase/client';
import { StudentProfile, GeneratedOutputs, RoleType } from '@/types/student';

interface GenerationCallbacks {
  onProgress: (step: string, progress: number) => void;
}

export async function generateCareerPack(
  profile: StudentProfile,
  callbacks: GenerationCallbacks
): Promise<GeneratedOutputs> {
  const { onProgress } = callbacks;
  const { selectedRoles, jobDescription } = profile;

  // Step 1: Generate CV
  onProgress('Generating your CV...', 10);
  const cvResponse = await supabase.functions.invoke('generate-content', {
    body: { type: 'cv', profile, role: selectedRoles[0], jobDescription },
  });
  
  if (cvResponse.error) {
    throw new Error(cvResponse.error.message || 'Failed to generate CV');
  }
  const cv = cvResponse.data.content;

  // Step 2: Generate LinkedIn
  onProgress('Optimizing LinkedIn profile...', 30);
  const linkedinResponse = await supabase.functions.invoke('generate-content', {
    body: { type: 'linkedin', profile, role: selectedRoles[0] },
  });
  
  if (linkedinResponse.error) {
    throw new Error(linkedinResponse.error.message || 'Failed to generate LinkedIn content');
  }
  
  let linkedin;
  try {
    const content = linkedinResponse.data.content;
    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    linkedin = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
  } catch (e) {
    // Fallback if JSON parsing fails
    linkedin = {
      headline: 'Pharmacy Professional | Patient Care Advocate',
      about: linkedinResponse.data.content,
      experienceBullets: [],
      skills: [],
      networkingMessage: '',
      openToWork: '',
    };
  }

  // Step 3: Generate Cover Letters for each role
  const coverLetters: { role: RoleType; content: string }[] = [];
  for (let i = 0; i < selectedRoles.length; i++) {
    const role = selectedRoles[i];
    onProgress(`Crafting cover letter for ${role} role...`, 50 + (i * 10));
    
    const coverResponse = await supabase.functions.invoke('generate-content', {
      body: { type: 'coverLetter', profile, role, jobDescription },
    });
    
    if (coverResponse.error) {
      throw new Error(coverResponse.error.message || `Failed to generate cover letter for ${role}`);
    }
    
    coverLetters.push({ role, content: coverResponse.data.content });
  }

  // Step 4: Generate Interview Prep for each role
  const interviewPrep: GeneratedOutputs['interviewPrep'] = [];
  for (let i = 0; i < selectedRoles.length; i++) {
    const role = selectedRoles[i];
    onProgress(`Preparing interview guide for ${role} role...`, 70 + (i * 10));
    
    const interviewResponse = await supabase.functions.invoke('generate-content', {
      body: { type: 'interview', profile, role },
    });
    
    if (interviewResponse.error) {
      throw new Error(interviewResponse.error.message || `Failed to generate interview prep for ${role}`);
    }
    
    let interviewData;
    try {
      const content = interviewResponse.data.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      interviewData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      // Fallback structure
      interviewData = {
        behavioral: [],
        technical: [],
        tellMeAboutYourself: { short: '', long: '' },
        questionsToAsk: [],
      };
    }
    
    interviewPrep.push({ role, ...interviewData });
  }

  onProgress('Finalizing your career pack...', 95);

  return {
    cv,
    linkedin,
    coverLetters,
    interviewPrep,
  };
}
