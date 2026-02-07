import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert pharmacy career coach with deep knowledge of:
- Hospital/Clinical Pharmacy careers (medication therapy management, clinical protocols, patient counseling)
- Pharmaceutical Industry careers (QA/QC, regulatory affairs, R&D, manufacturing)
- Community/Retail Pharmacy (dispensing, patient care, business operations)
- Pharmacy education (PharmD, BPharm, MPharm programs)
- Professional certifications (BLS, ACLS, Board certifications)
- Resume/CV best practices for pharmacy professionals
- Interview preparation for pharmacy positions

Your role is to help pharmacy students fill out their career profile effectively by:
1. Helping them articulate their experience using strong action verbs and quantifiable achievements
2. Suggesting relevant skills based on their target roles
3. Guiding them on how to present their Final Year Project/Research effectively
4. Providing specific, actionable advice tailored to the pharmacy industry
5. Using pharmaceutical terminology appropriately

Be encouraging, specific, and professional. Keep responses concise but helpful.
When they ask about a specific section, provide examples relevant to pharmacy careers.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, currentStep, formData, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context message
    const contextInfo = `
Current form section: ${currentStep}
Student info so far:
- Name: ${formData?.full_name || 'Not provided'}
- Degree: ${formData?.degree || 'Not provided'}
- University: ${formData?.university || 'Not provided'}
- Target roles: ${formData?.selected_roles?.join(', ') || 'Not selected'}
`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Context:\n${contextInfo}` },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Coach error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
