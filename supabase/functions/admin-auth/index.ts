import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, username, password } = await req.json();

    if (action === 'login') {
      // Simple auth check against the admins table
      // In production, use proper password hashing
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/admins?username=eq.${encodeURIComponent(username)}&select=*`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      });

      const admins = await response.json();
      
      if (admins.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const admin = admins[0];
      
      // Simple password check (in production, use bcrypt)
      if (admin.password_hash !== password) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Generate a simple session token
      const token = crypto.randomUUID();

      return new Response(
        JSON.stringify({ success: true, token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
