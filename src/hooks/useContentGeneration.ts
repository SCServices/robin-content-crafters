import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessInfo } from "@/lib/types";

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const createCompanyAndContent = async (businessInfo: BusinessInfo) => {
    setIsGenerating(true);
    setProgress(0);
    
    const progressToast = toast.loading('Starting content generation process...', {
      duration: Infinity,
    });

    try {
      let companyData;
      
      toast.loading('Checking existing company data...', { id: progressToast });
      // Check if company already exists by name
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("*")
        .eq("name", businessInfo.companyName)
        .limit(1);

      if (existingCompany && existingCompany.length > 0) {
        toast.loading('Updating existing company information...', { id: progressToast });
        // Update existing company
        const { data: updatedCompany, error: updateError } = await supabase
          .from("companies")
          .update({
            industry: businessInfo.industry,
            website: businessInfo.website,
          })
          .eq("id", existingCompany[0].id)
          .select()
          .single();

        if (updateError) throw updateError;
        companyData = updatedCompany;

        // Delete existing services and locations
        await supabase.from("services").delete().eq("company_id", companyData.id);
        await supabase.from("service_locations").delete().eq("company_id", companyData.id);
      } else {
        toast.loading('Creating new company profile...', { id: progressToast });
        // Insert new company
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: businessInfo.companyName,
            industry: businessInfo.industry,
            website: businessInfo.website,
          })
          .select()
          .single();

        if (companyError) throw companyError;
        companyData = newCompany;
      }

      setProgress(20);
      toast.loading('Setting up service information...', { id: progressToast });
      // Insert services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .insert(
          businessInfo.services.map((service) => ({
            company_id: companyData.id,
            name: service,
          }))
        )
        .select();

      if (servicesError) throw servicesError;

      setProgress(40);
      toast.loading('Adding location data...', { id: progressToast });
      // Insert locations
      const { data: locationsData, error: locationsError } = await supabase
        .from("service_locations")
        .insert(
          businessInfo.locations.map((location) => ({
            company_id: companyData.id,
            location: location,
          }))
        )
        .select();

      if (locationsError) throw locationsError;

      setProgress(60);
      toast.loading('Preparing content structure...', { id: progressToast });
      
      // Create content entries for each combination
      const contentEntries = [];
      const getRandomTemplate = (templates: string[]) => templates[Math.floor(Math.random() * templates.length)];

      // Service pages
      for (const service of servicesData) {
        if (!service?.id) continue;
        
        const serviceTitleTemplates = [
          `Professional ${service.name} Services by ${businessInfo.companyName}`,
          `Expert ${service.name} Solutions | ${businessInfo.companyName}`,
          `Trusted ${service.name} Services Near You`,
          `Quality ${service.name} Services - ${businessInfo.companyName}`,
          `Leading Provider of ${service.name} Services`,
        ];

        contentEntries.push({
          company_id: companyData.id,
          service_id: service.id,
          title: getRandomTemplate(serviceTitleTemplates),
          type: "service",
        });
      }

      // Location pages and blog posts
      for (const service of servicesData) {
        if (!service?.id) continue;
        for (const location of locationsData) {
          if (!location?.id) continue;

          const locationTitleTemplates = [
            `${service.name} Services in ${location.location} | ${businessInfo.companyName}`,
            `Local ${service.name} Experts in ${location.location}`,
            `Professional ${service.name} Services - ${location.location} Area`,
            `${location.location}'s Trusted ${service.name} Provider`,
            `${service.name} Solutions in ${location.location}`,
          ];

          const blogTitleTemplates = [
            `${service.name} Guide: Essential Tips for ${location.location} Residents`,
            `Top ${service.name} Solutions in ${location.location}: Complete Guide`,
            `How to Choose the Best ${service.name} Service in ${location.location}`,
            `${location.location} ${service.name} Services: What You Need to Know`,
            `Expert Tips for ${service.name} in ${location.location}`,
          ];

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: getRandomTemplate(locationTitleTemplates),
            type: "location",
          });

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: getRandomTemplate(blogTitleTemplates),
            type: "blog",
          });
        }
      }

      setProgress(80);
      // Insert all content entries
      if (contentEntries.length > 0) {
        const { error: contentError } = await supabase
          .from("generated_content")
          .insert(contentEntries);

        if (contentError) throw contentError;
      }

      // Start content generation process
      toast.loading('Starting AI content generation...', { id: progressToast });
      const totalItems = servicesData.length * (1 + locationsData.length * 2);
      let completedItems = 0;

      for (const service of servicesData) {
        if (!service?.id) continue;
        const companyInfo = {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: service.name,
          companyId: companyData.id,
        };

        // Generate service page with enhanced prompt
        await supabase.functions.invoke("generate-content", {
          body: {
            contentType: "service",
            companyInfo,
            serviceId: service.id,
            prompt: `
**Task:**
Write a comprehensive service page for **${businessInfo.companyName}**, a ${businessInfo.industry} company, focusing on their **${service.name}** service.

**Structure:**
1. **Introduction**: Provide a compelling overview of the service.
2. **Key Benefits and Features**: Highlight what sets this service apart.
3. **Why Choose ${businessInfo.companyName}**: Emphasize experience, expertise, and any certifications.
4. **Our ${service.name} Process**: Describe step-by-step what customers can expect.
5. **Common Problems We Solve**: Address typical issues and how the service provides solutions.
6. **Call to Action**: Encourage readers to contact or schedule a service.

**Requirements:**
- Write in SEO-friendly Markdown format with appropriate headings
- Use conversational, friendly tone with simple language
- Keep sentences short (15-20 words)
- Include bullet points and numbered lists
- Aim for 800-1000 words
- Focus on value proposition and customer needs
`,
          },
        });
        completedItems++;
        setProgress(80 + (completedItems / totalItems) * 20);
        toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });

        // Generate location pages and blog posts
        for (const location of locationsData) {
          if (!location?.id) continue;
          const locationInfo = {
            ...companyInfo,
            location: location.location,
          };

          // Generate location page with enhanced prompt
          await supabase.functions.invoke("generate-content", {
            body: {
              contentType: "location",
              companyInfo: locationInfo,
              serviceId: service.id,
              locationId: location.id,
              prompt: `
**Task:**
Write a location-specific service page for **${businessInfo.companyName}**'s **${service.name}** service in **${location.location}**.

**Structure:**
1. **Introduction**: Local context overview
2. **Services in ${location.location}**: Detail offerings
3. **Why Choose Us**: Local experience and community involvement
4. **Service Coverage**: Specific areas served
5. **Location Benefits**: Local conditions and value
6. **Contact Information**: Clear call to action

**Requirements:**
- Include local landmarks and community aspects
- SEO-friendly Markdown format
- Simple, conversational language
- 600-800 words
- Optimize for local keywords
`,
            },
          });
          completedItems++;
          setProgress(80 + (completedItems / totalItems) * 20);
          toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });

          // Generate blog post with enhanced prompt
          await supabase.functions.invoke("generate-content", {
            body: {
              contentType: "blog",
              companyInfo: locationInfo,
              serviceId: service.id,
              locationId: location.id,
              prompt: `
**Task:**
Write an informative blog post about **${service.name}** services in **${location.location}** for **${businessInfo.companyName}**.

**Content Type Options:**
- Listicle
- How-To Guide
- Comparison Post
- Case Study
- Expert Tips
- Problem-Solution Post

**Requirements:**
- SEO-friendly Markdown format
- Include actionable advice
- Use local examples
- 800-1000 words
- Include relevant statistics
- Focus on local audience needs
`,
            },
          });
          completedItems++;
          setProgress(80 + (completedItems / totalItems) * 20);
          toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });
        }
      }

      toast.success('Content generation completed successfully!', { id: progressToast });
      return { success: true };
    } catch (error) {
      console.error("Error:", error);
      toast.error('An error occurred while processing your information', { id: progressToast });
      return { success: false, error };
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return {
    createCompanyAndContent,
    isGenerating,
    progress,
  };
};