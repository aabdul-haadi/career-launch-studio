import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { submissionId, documents } = await req.json();

    if (!submissionId || !documents || !Array.isArray(documents) || documents.length === 0) {
      throw new Error("Missing submissionId or documents");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const uploadedDocs: { name: string; type: string; url: string; size: number }[] = [];

    for (const doc of documents) {
      const { name, type, base64Data } = doc;
      
      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const filePath = `${submissionId}/${name}`;

      const { error: uploadError } = await supabase.storage
        .from("career-packs")
        .upload(filePath, bytes, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload ${name}: ${uploadError.message}`);
      }

      uploadedDocs.push({
        name,
        type,
        storagePath: filePath,
        size: bytes.length,
      });
    }

    // Set 48-hour expiry
    const sharedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("student_submissions")
      .update({
        shared_documents: uploadedDocs,
        shared_at: sharedAt,
        share_expires_at: expiresAt,
      })
      .eq("id", submissionId);

    if (updateError) {
      throw new Error(`Failed to update submission: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        documents: uploadedDocs,
        expiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
