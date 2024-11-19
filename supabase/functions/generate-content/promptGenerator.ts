export function generatePrompt(contentType: string, companyInfo: any, service: any, location: any) {
  const systemPrompt = `You are a Local SEO expert and experienced content writer specializing in creating high-quality, SEO-optimized content for business websites in blue-collar industries. Write in a clear, engaging style that resonates with local customers.`;

  let userPrompt = '';
  switch (contentType) {
    case 'service':
      userPrompt = `Write a service page for ${companyInfo.companyName}'s ${service.name} service.
                    Use this title as H1: "Get the Best ${service.name} in ${location?.location || 'Your Area'}"
                    
                    Include these sections:
                    1. Brief Introduction
                    2. Our ${service.name} Services
                    3. Why Choose Us
                    4. Service Process
                    5. Benefits
                    6. Call to Action
                    
                    Make it local-focused, SEO-friendly, and around 800-1000 words.`;
      break;
    case 'location':
      userPrompt = `Write a location-specific service page for ${companyInfo.companyName}'s ${service.name} service in ${location?.location || 'Your Area'}.
                    Use this title as H1: "Expert ${service.name} Services in ${location?.location || 'Your Area'}"
                    
                    Include these sections:
                    1. Introduction (with local context)
                    2. Our ${service.name} Services in ${location?.location || 'Your Area'}
                    3. Why Choose ${companyInfo.companyName} in ${location?.location || 'Your Area'}
                    4. Local Service Coverage
                    5. ${location?.location || 'Your Area'}-Specific Benefits
                    6. Contact Information and Call to Action
                    
                    Ensure the content is engaging, informative, and SEO-optimized, around 600-800 words.`;
      break;
    case 'blog':
      userPrompt = `Write an informative blog post for ${companyInfo.companyName}, a ${companyInfo.industry} company, about ${service.name} services in ${location?.location || 'Your Area'}.
                    Use an engaging title relevant to the topic.
                    
                    Include practical tips, examples, and address pain points of local customers.
                    
                    Aim for a length of 800-1000 words and maintain a friendly, conversational tone.`;
      break;
    // ... additional cases can be added here for other content types
  }

  return { system: systemPrompt, user: userPrompt };
}
