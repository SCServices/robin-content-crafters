import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { generatePrompt } from './promptGenerator.ts';

export async function generateContent(
  contentType: string,
  companyInfo: any,
  serviceId: string,
  locationId: string | null,
  supabase: ReturnType<typeof createClient>
) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Fetch service and location details
  const { data: service } = await supabase
    .from('services')
    .select('name')
    .eq('id', serviceId)
    .single();

  let location = null;
  if (locationId) {
    const { data: locationData } = await supabase
      .from('service_locations')
      .select('location')
      .eq('id', locationId)
      .single();
    location = locationData;
  }

  // Generate title and meta description
  const title = `Get the Best ${service.name} in ${location?.location || 'Your Area'}`;
  const metaDescription = `Professional ${service.name} services in ${location?.location || 'your area'} by ${companyInfo.companyName}. Our experienced team provides reliable, efficient, and affordable solutions tailored to your needs. Contact us today for expert ${service.name.toLowerCase()} services you can trust.`;

  // Generate content using OpenAI
  const prompt = generatePrompt(contentType, companyInfo, service, location);
  
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      temperature: 0.7,
    }),
  });

  if (!openAIResponse.ok) {
    throw new Error('Failed to generate content');
  }

  const completion = await openAIResponse.json();
  const generatedContent = completion.choices[0].message.content;

  // Update the database
  const { error: updateError } = await supabase
    .from('generated_content')
    .update({ 
      title,
      content: generatedContent,
      meta_description: metaDescription,
      status: 'generated'
    })
    .match({ 
      company_id: companyInfo.companyId,
      service_id: serviceId,
      ...(locationId ? { location_id: locationId } : {}),
      type: contentType
    });

  if (updateError) throw updateError;

  return { title, content: generatedContent, metaDescription };
}