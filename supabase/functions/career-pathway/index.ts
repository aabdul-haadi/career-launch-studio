import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a pharmacy career counselor and strategic advisor with expertise in career pathway modeling.

Analyze the candidate's profile against pharmacy role requirements and provide predictive career pathway modeling.

ANALYSIS FRAMEWORK:
1. Profile Strength Assessment: Evaluate current qualifications, skills, and experience
2. Gap Analysis: Identify missing qualifications, skills, or experience for target roles
3. Career Pathways: Map potential career trajectories (5-year, 10-year projections)
4. Competitive Positioning: How they compare to typical candidates
5. Development Recommendations: Prioritized actions to improve candidacy

CRITICAL RULES:
- Be realistic about gaps and timeframes
- Consider regulatory requirements for the candidate's location
- Account for industry trends and emerging opportunities
- Provide specific, actionable recommendations
- Include alternative pathways if primary goals are challenging

OUTPUT FORMAT (JSON):
{
  "profileAssessment": {
    "overallScore": 0-100,
    "strengthLevel": "strong" | "moderate" | "developing",
    "summary": "2-3 sentence assessment",
    "keyStrengths": ["strength1", "strength2"],
    "developmentAreas": ["area1", "area2"]
  },
  "roleReadiness": [
    {
      "role": "role type",
      "readinessScore": 0-100,
      "readinessLevel": "ready" | "almost-ready" | "developing" | "early-stage",
      "matchingStrengths": ["what aligns well"],
      "gapsToAddress": ["what needs development"],
      "estimatedTimeToReady": "timeframe if not ready"
    }
  ],
  "careerPathways": [
    {
      "pathName": "pathway name",
      "probability": "high" | "medium" | "low",
      "milestones": [
        { "year": 1, "position": "role", "requirements": "what to achieve" },
        { "year": 3, "position": "role", "requirements": "what to achieve" },
        { "year": 5, "position": "role", "requirements": "what to achieve" }
      ],
      "salaryProgression": { "year1": "range", "year3": "range", "year5": "range" }
    }
  ],
  "competitivePositioning": {
    "percentile": 0-100,
    "benchmarkComparison": "how they compare to typical candidates",
    "uniqueAdvantages": ["what sets them apart"],
    "criticalGaps": ["most important gaps to address"]
  },
  "developmentPlan": {
    "immediate": [
      { "action": "action to take", "timeframe": "0-3 months", "impact": "high/medium/low", "resources": "how to do it" }
    ],
    "shortTerm": [
      { "action": "action to take", "timeframe": "3-12 months", "impact": "high/medium/low", "resources": "how to do it" }
    ],
    "longTerm": [
      { "action": "action to take", "timeframe": "1-3 years", "impact": "high/medium/low", "resources": "how to do it" }
    ]
  },
  "certificationRecommendations": [
    { "name": "certification", "provider": "organization", "priority": "high/medium/low", "value": "why it's valuable" }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, targetRoles } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `Analyze this pharmacy candidate's career pathway:

CANDIDATE PROFILE:
Name: ${profile.personal?.fullName || 'Not provided'}
Location: ${profile.personal?.city ? `${profile.personal.city}, ` : ''}${profile.personal?.country || 'Not specified'}

EDUCATION:
- Degree: ${profile.education?.degree || 'Not specified'}
- University: ${profile.education?.university || 'Not specified'}
- Graduation: ${profile.education?.graduationDate || 'Not specified'}
- GPA: ${profile.education?.gpa || 'Not provided'}
- Coursework: ${profile.education?.coursework?.join(', ') || 'Not specified'}

EXPERIENCE:
${profile.experience?.length > 0 ? profile.experience.map((exp: any) => 
  `- ${exp.organization} (${exp.type}): ${exp.responsibilities}`
).join('\n') : 'No experience listed'}

RESEARCH/FYP:
- Title: ${profile.fyp?.title || 'Not specified'}
- Methods: ${profile.fyp?.methods || 'Not specified'}
- Tools: ${profile.fyp?.tools?.join(', ') || 'Not specified'}

SKILLS:
- Technical: ${profile.skills?.hardSkills?.join(', ') || 'Not specified'}
- Soft Skills: ${profile.skills?.softSkills?.join(', ') || 'Not specified'}
- Tools: ${profile.skills?.tools?.join(', ') || 'Not specified'}

CERTIFICATIONS:
${profile.certifications?.length > 0 ? profile.certifications.map((cert: any) => 
  `- ${cert.name} (${cert.provider}, ${cert.year})`
).join('\n') : 'None listed'}

TARGET ROLES: ${targetRoles?.join(', ') || profile.selectedRoles?.join(', ') || 'Hospital, Industry, Community'}

Provide comprehensive career pathway analysis with realistic assessments and actionable recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
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

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse career pathway analysis:", e);
      throw new Error("Failed to parse career pathway analysis");
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Career pathway analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
