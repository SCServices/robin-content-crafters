export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function handleError(error: Error) {
  console.error('Error in generate-content function:', error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { 
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}