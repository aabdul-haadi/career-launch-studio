import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Pharmaceutical domain knowledge base
const PHARMACY_CONTEXT = `
You are a pharmaceutical career expert assistant. You provide contextual suggestions for pharmacy professionals building their career documents.

DOMAIN EXPERTISE:
- Pharmacotherapy knowledge across therapeutic areas (cardiology, oncology, infectious disease, etc.)
- Regulatory frameworks: NAPRA, FDA, EMA, ACPE, PEBC, state pharmacy boards
- Practice settings: hospital/clinical, community, industry (QA/QC/Regulatory Affairs/R&D/Medical Affairs)
- Credential requirements: PharmD, BPharm, board certifications, residency programs
- Key competencies: MTM, DUR, compounding, sterile preparations, pharmacovigilance, GMP compliance

RESPONSE RULES:
1. Provide 3-5 specific, actionable suggestions
2. Use pharmaceutical industry terminology appropriately
3. Tailor suggestions based on the user's role preferences (hospital, industry, community)
4. Keep suggestions concise but professional
5. Include relevant keywords for ATS optimization when applicable
`;

interface SuggestionRequest {
  field: string;
  currentValue: string;
  context: Record<string, unknown>;
  targetRoles?: string[];
}

interface SuggestionResponse {
  suggestions: string[];
  fieldType: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { field, currentValue, context, targetRoles } = await req.json() as SuggestionRequest;

    const SUGGESTION_API_KEY = Deno.env.get("SUGGESTION_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Use LOVABLE_API_KEY as fallback if SUGGESTION_API_KEY is not set
    const apiKey = SUGGESTION_API_KEY || LOVABLE_API_KEY;
    
    if (!apiKey) {
      throw new Error("No API key configured for suggestions");
    }

    // Build contextual prompt based on field type
    const prompt = buildFieldPrompt(field, currentValue, context, targetRoles || []);

    // Use Lovable AI Gateway for generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY || SUGGESTION_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: PHARMACY_CONTEXT },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
    const content = data.choices?.[0]?.message?.content || "";

    // Parse suggestions from response
    const suggestions = parseSuggestions(content, field);

    const result: SuggestionResponse = {
      suggestions,
      fieldType: field,
      confidence: 0.85,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Suggestion error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildFieldPrompt(
  field: string,
  currentValue: string,
  context: Record<string, unknown>,
  targetRoles: string[]
): string {
  const roleContext = targetRoles.length > 0 
    ? `Target pharmacy roles: ${targetRoles.join(", ")}.` 
    : "";

  const fieldPrompts: Record<string, string> = {
    // Personal Info
    fullName: `The user is entering their name. Current value: "${currentValue}". Suggest professional formatting tips for pharmacy CVs.`,
    
    city: `The user is entering their city. Current value: "${currentValue}". Based on pharmacy job markets, suggest major pharmaceutical hub cities if relevant.`,
    
    country: `The user is entering their country. Current value: "${currentValue}". Suggest countries with strong pharmaceutical industries.`,

    // Education
    university: `The user is entering their pharmacy school. Current value: "${currentValue}". ${roleContext} Suggest how to present their education effectively.`,
    
    gpa: `The user is entering their GPA. Current value: "${currentValue}". Suggest whether and how to present their GPA based on pharmacy industry standards.`,
    
    coursework: `The user is selecting relevant coursework. Current selections: "${currentValue}". ${roleContext} Suggest the most relevant courses for their target roles.`,

    // Experience
    organization: `The user is entering an organization name for their experience. Current value: "${currentValue}". ${roleContext} Suggest how to present this organization effectively.`,
    
    department: `The user is entering a department for their experience. Current value: "${currentValue}". ${roleContext} Suggest relevant pharmacy departments.`,
    
    responsibilities: `The user is writing responsibilities. Current value: "${currentValue}". ${roleContext} Suggest strong action verbs and impactful phrasing for pharmacy professionals. Context: ${JSON.stringify(context)}`,
    
    achievements: `The user is writing achievements. Current value: "${currentValue}". ${roleContext} Suggest metrics and outcome-focused language appropriate for pharmacy. Context: ${JSON.stringify(context)}`,

    // FYP/Research
    fypTitle: `The user is entering their research project title. Current value: "${currentValue}". ${roleContext} Suggest how to present pharmaceutical research effectively.`,
    
    fypObjectives: `The user is describing research objectives. Current value: "${currentValue}". ${roleContext} Suggest clear, impactful objective phrasing for pharmaceutical research.`,
    
    fypMethods: `The user is describing research methods. Current value: "${currentValue}". ${roleContext} Suggest standard pharmaceutical research methodology terms.`,
    
    fypOutcomes: `The user is describing research outcomes. Current value: "${currentValue}". ${roleContext} Suggest how to quantify and present pharmaceutical research outcomes.`,

    // Skills
    hardSkills: `The user is selecting hard skills. Current selections: "${currentValue}". ${roleContext} Suggest the most in-demand technical pharmacy skills.`,
    
    softSkills: `The user is selecting soft skills. Current selections: "${currentValue}". ${roleContext} Suggest soft skills most valued in pharmacy settings.`,
    
    tools: `The user is selecting tools/software. Current selections: "${currentValue}". ${roleContext} Suggest pharmacy-specific tools and systems.`,

    // Role Preferences
    interestArea: `The user is describing their interest area. Current value: "${currentValue}". Target role: ${targetRoles[0] || 'not specified'}. Suggest specific areas within their target pharmacy sector.`,
    
    strengths: `The user is describing their strengths. Current value: "${currentValue}". ${roleContext} Suggest how to articulate pharmacy-specific strengths.`,

    // Job Description Analysis
    jobDescription: `The user has provided a job description. Analyze it and suggest key keywords, skills, and phrases to incorporate into their application materials. Job description: "${currentValue}". ${roleContext}`,

    // Default
    default: `The user is filling a pharmacy career form. Field: ${field}. Current value: "${currentValue}". ${roleContext} Provide helpful suggestions. Context: ${JSON.stringify(context)}`,
  };

  const basePrompt = fieldPrompts[field] || fieldPrompts.default;
  
  return `${basePrompt}

Provide exactly 3-5 specific suggestions as a numbered list. Each suggestion should be practical and directly applicable.`;
}

function parseSuggestions(content: string, field: string): string[] {
  // Try to extract numbered list items
  const lines = content.split('\n').filter(line => line.trim());
  const suggestions: string[] = [];

  for (const line of lines) {
    // Match numbered items (1. , 2. , etc.) or bullet points
    const match = line.match(/^[\d]+[\.\)]\s*(.+)|^[-•*]\s*(.+)/);
    if (match) {
      const suggestion = (match[1] || match[2]).trim();
      if (suggestion && suggestion.length > 5) {
        suggestions.push(suggestion);
      }
    }
  }

  // If we couldn't parse, split by sentences
  if (suggestions.length === 0) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  return suggestions.slice(0, 5);
}
