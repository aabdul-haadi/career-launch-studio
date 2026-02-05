import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert pharmacy job market analyst with deep knowledge of global pharmaceutical industry trends, salary benchmarks, and hiring patterns.

Analyze the pharmacy job market for the specified location and role type. Provide actionable intelligence including:

1. Market Overview: Current demand, growth trends, key employers
2. Salary Benchmarks: Entry-level to senior ranges with currency
3. Top Employers: Leading organizations hiring in this sector
4. Required Qualifications: Essential certifications, licenses, education
5. Emerging Trends: New technologies, therapeutic areas, regulatory changes
6. Competitive Analysis: What differentiates top candidates

CRITICAL RULES:
- Provide realistic, research-based salary ranges for the specific location
- Account for local regulatory requirements (e.g., NAPRA for Canada, GPhC for UK, state boards for US)
- Include both traditional and emerging career paths
- Be specific about geographic market conditions

OUTPUT FORMAT (JSON):
{
  "marketOverview": {
    "demandLevel": "high" | "moderate" | "low",
    "growthTrend": "growing" | "stable" | "declining",
    "openPositions": "estimated number range",
    "summary": "2-3 sentence market summary"
  },
  "salaryBenchmarks": {
    "currency": "local currency code",
    "entryLevel": { "min": number, "max": number },
    "midLevel": { "min": number, "max": number },
    "seniorLevel": { "min": number, "max": number }
  },
  "topEmployers": [
    { "name": "employer name", "type": "hospital/industry/retail", "positions": "common roles" }
  ],
  "requiredQualifications": [
    { "name": "qualification", "importance": "required" | "preferred", "description": "brief description" }
  ],
  "emergingTrends": [
    { "trend": "trend name", "impact": "how it affects job seekers", "timeframe": "current/near-term/long-term" }
  ],
  "competitiveBenchmarks": {
    "topSkills": ["skill1", "skill2"],
    "differentiators": ["what makes candidates stand out"],
    "gapAnalysis": "common gaps in candidate profiles"
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { country, city, roleType, profile } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `Analyze the pharmacy job market for:

LOCATION: ${city ? `${city}, ` : ''}${country}
ROLE TYPE: ${roleType} (${roleType === 'hospital' ? 'Hospital/Clinical Pharmacy' : roleType === 'industry' ? 'Pharmaceutical Industry QA/QC/Regulatory' : 'Community/Retail Pharmacy'})

${profile ? `CANDIDATE PROFILE:
- Degree: ${profile.education?.degree || 'Not specified'}
- University: ${profile.education?.university || 'Not specified'}
- Experience: ${profile.experience?.length || 0} positions
- Skills: ${profile.skills?.hardSkills?.join(', ') || 'Not specified'}
- Target: ${profile.selectedRoles?.join(', ') || roleType}` : ''}

Provide comprehensive job market intelligence with realistic data for this specific location.`;

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
        temperature: 0.7,
        max_tokens: 3000,
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
      console.error("Failed to parse job market analysis:", e);
      throw new Error("Failed to parse job market analysis");
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Job market analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
