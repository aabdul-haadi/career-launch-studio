import { supabase } from '@/integrations/supabase/client';
import { StudentProfile, GeneratedOutputs, RoleType } from '@/types/student';

interface GenerationCallbacks {
  onProgress: (step: string, progress: number) => void;
}

function parseJson<T>(content: string, fallback: T): T {
  try {
    const m = content.match(/\{[\s\S]*\}/);
    return JSON.parse(m ? m[0] : content);
  } catch {
    return fallback;
  }
}

async function invoke(body: Record<string, unknown>, label: string, attempt = 0): Promise<string> {
  const res = await supabase.functions.invoke('generate-content', { body });
  if (res.error || !res.data?.content) {
    if (attempt < 1) return invoke(body, label, attempt + 1); // one quick retry
    throw new Error(res.error?.message || `Failed to generate ${label}`);
  }
  return res.data.content as string;
}

export async function generateCareerPack(
  profile: StudentProfile,
  callbacks: GenerationCallbacks
): Promise<GeneratedOutputs> {
  const { onProgress } = callbacks;
  const { jobDescription } = profile;
  const selectedRoles: RoleType[] = profile.selectedRoles?.length ? profile.selectedRoles : (['hospital'] as RoleType[]);

  const total = 2 + selectedRoles.length * 2;
  let done = 0;
  const tick = (label: string) => {
    done++;
    onProgress(`${label} ready (${done}/${total})`, Math.round(10 + (done / total) * 85));
  };

  onProgress('Generating all documents in parallel...', 10);

  const cvP = invoke({ type: 'cv', profile, role: selectedRoles[0], jobDescription }, 'CV').then((c) => { tick('CV'); return c; });
  const liP = invoke({ type: 'linkedin', profile, role: selectedRoles[0] }, 'LinkedIn').then((c) => { tick('LinkedIn'); return c; });
  const coverP = Promise.all(selectedRoles.map((role) =>
    invoke({ type: 'coverLetter', profile, role, jobDescription }, `cover letter (${role})`).then((content) => { tick(`Cover letter (${role})`); return { role, content }; })
  ));
  const interviewP = Promise.all(selectedRoles.map((role) =>
    invoke({ type: 'interview', profile, role }, `interview prep (${role})`).then((content) => {
      tick(`Interview prep (${role})`);
      return { role, ...parseJson(content, { behavioral: [], technical: [], tellMeAboutYourself: { short: '', long: '' }, questionsToAsk: [] }) };
    })
  ));

  const [cv, liRaw, coverLetters, interviewPrep] = await Promise.all([cvP, liP, coverP, interviewP]);

  const linkedin = parseJson(liRaw, {
    headline: 'Pharmacy Professional | Patient Care Advocate',
    about: liRaw,
    experienceBullets: [],
    skills: [],
    networkingMessage: '',
    openToWork: '',
  });

  onProgress('Finalizing your career pack...', 98);
  return { cv, linkedin, coverLetters, interviewPrep } as GeneratedOutputs;
}
