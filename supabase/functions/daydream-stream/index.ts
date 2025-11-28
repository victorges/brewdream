// Version: 2025-10-18-v3
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  console.log('[EDGE] daydream-stream function called (version: 2025-10-12-correct-api-endpoint)');

  try {
    const body = await req.json();
    const isStaging = body.isStaging;

    const apiKeyEnvName = isStaging ? 'STAGING_DAYDREAM_API_KEY' : 'DAYDREAM_API_KEY';
    const DAYDREAM_API_KEY = Deno.env.get(apiKeyEnvName);

    if (!DAYDREAM_API_KEY) {
      throw new Error(`${apiKeyEnvName} is not configured`);
    }

    const pipeline_id = body.pipeline_id || 'pip_SDXL-turbo';
    const initialParams = body.initialParams;
    const baseUrl = isStaging ? 'https://api.daydream.monster' : 'https://api.daydream.live';

    console.log('[EDGE] Creating Daydream stream with pipeline:', pipeline_id);

    // Create payload with pipeline_id and optional pipeline_params
    const createPayload: any = {
      pipeline_id
    };

    // If initial params provided, include them as pipeline_params in creation
    if (initialParams) {
      console.log('[EDGE] Including initial params as pipeline_params:', JSON.stringify(initialParams, null, 2));
      createPayload.pipeline_params = initialParams;
    }

    const createResponse = await fetch(`${baseUrl}/v1/streams`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAYDREAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    const streamData = await createResponse.json();
    console.log('Daydream stream created:', streamData);

    if (!createResponse.ok) {
      console.error('Daydream API error:', streamData);
      return new Response(JSON.stringify({ error: streamData }), {
        status: createResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { id, output_playback_id, whip_url } = streamData;

    // Return immediately with stream info
    return new Response(JSON.stringify({ id, output_playback_id, whip_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in daydream-stream function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
