import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS = {
  cv: `You are a professional CV writer specializing in pharmacy careers. Generate an ATS-friendly CV based on the provided profile.

CRITICAL RULES:
1. NEVER fabricate employers, certifications, degrees, or metrics not provided
2. Use action verbs and professional language
3. Keep it to 1 page (2 pages max if content warrants)
4. No tables, columns, or graphics - pure text format
5. Use bullet points with impact-focused wording
6. If information is missing, use professional neutral phrasing

FORMAT:
[FULL NAME]
[City, Country] | [Phone] | [Email] | [LinkedIn URL if provided]

PROFESSIONAL SUMMARY
[3-4 lines tailored to the target role]

EDUCATION
[Degree] | [University]
Expected Graduation: [Date] | GPA: [if provided]
Relevant Coursework: [List]

EXPERIENCE
[Organization] | [Department]
[Type] | [Dates]
• [Responsibility/achievement with action verb]

FINAL YEAR PROJECT
[Title]
• [Objectives and methods]
• [Key outcomes if provided]

SKILLS
Technical: [List]
Software: [List]
Interpersonal: [List]

CERTIFICATIONS
• [Name] - [Provider] ([Year])

ACTIVITIES & LEADERSHIP
• [Description]`,

  linkedin: `You are a LinkedIn optimization expert for pharmacy professionals. Generate compelling LinkedIn content.

RULES:
1. Headline: Max 220 characters, keyword-rich, value-proposition focused
2. About: Max 2000 characters, first-person, engaging, with clear career goals
3. Use relevant pharmacy and healthcare keywords
4. Keep experience bullets concise and impactful
5. Suggest top 15-20 relevant skills

OUTPUT FORMAT (JSON):
{
  "headline": "...",
  "about": "...",
  "experienceBullets": ["...", "..."],
  "skills": ["...", "..."],
  "networkingMessage": "Short template for connecting with professionals",
  "openToWork": "Brief message for open-to-work status"
}`,

  coverLetter: `You are a cover letter expert for pharmacy professionals. Write a compelling cover letter.

RULES:
1. 250-350 words, 3 paragraphs + closing
2. Use placeholders: [Hiring Manager Name], [Organization Name], [City]
3. Tailor to the specific role type
4. Reference specific experiences from the profile
5. Show genuine interest and value proposition
6. NEVER fabricate experiences or qualifications
7. If job description provided, incorporate relevant keywords

ROLE CONTEXT:
- Hospital: Focus on clinical skills, patient care, interprofessional collaboration
- Industry: Focus on quality, compliance, analytical skills, regulatory knowledge  
- Community: Focus on patient counseling, medication management, accessibility`,

  interview: `You are an interview coach for pharmacy candidates. Generate interview prep materials.

RULES:
1. Behavioral questions: Use STAR format (Situation, Task, Action, Result)
2. Ground all answers in the provided profile - NO fabrication
3. Technical questions should be role-appropriate
4. Keep answers professional and specific to pharmacy

OUTPUT FORMAT (JSON):
{
  "behavioral": [
    {"question": "...", "answer": "STAR-formatted answer based on profile"}
  ],
  "technical": [
    {"question": "...", "answer": "Concise technical answer"}
  ],
  "tellMeAboutYourself": {
    "short": "30-second version",
    "long": "90-second version"
  },
  "questionsToAsk": ["...", "..."]
}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, profile, role, jobDescription } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = PROMPTS[type as keyof typeof PROMPTS];
    if (!systemPrompt) {
      throw new Error(`Unknown generation type: ${type}`);
    }

    // Add role context for cover letters and interview prep
    if (type === 'coverLetter' && role) {
      systemPrompt += `\n\nTARGET ROLE: ${role}`;
    }
    if (type === 'interview' && role) {
      systemPrompt += `\n\nTARGET ROLE: ${role}\nGenerate 10 behavioral and 10 technical questions.`;
    }

    systemPrompt += `\n\nACCURACY: Use ONLY facts present in PROFILE. Omit empty sections entirely instead of writing placeholders like "Not provided". Use the exact names of the university, employers, and project as given.${(type === "linkedin" || type === "interview") ? " Return ONLY raw JSON, no markdown fences." : ""}`;

    const userMessage = `Generate ${type} content for:

PROFILE:
${JSON.stringify(profile, null, 2)}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}
${role ? `TARGET ROLE: ${role}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
