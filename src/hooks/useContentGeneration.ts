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

      // Service pages
for (const service of servicesData) {
  if (!service?.id) continue;

  // Expanded array of title templates for service pages
  const serviceTitleTemplates = [
    `Get Reliable ${service.name} Services Today`,
    `Your Trusted Source for ${service.name}`,
    `Affordable ${service.name} Solutions Near You`,
    `Expert Help with ${service.name}`,
    `Top Choice for ${service.name} Needs`,
    `Professional ${service.name} Services You Can Trust`,
    `Quality ${service.name} at Great Prices`,
    `Experienced ${service.name} Specialists Ready to Help`,
    `Quick and Easy ${service.name} Solutions`,
    `Dependable ${service.name} Services for Your Home`,
    `Simplify Your ${service.name} Needs Today`,
    `Trusted ${service.name} Professionals at Your Service`,
    `Exceptional ${service.name} Services for You`,
    `Best ${service.name} Services in Town`,
    `Friendly and Reliable ${service.name} Experts`,
    `Your Go-To Team for ${service.name} Services`,
    `Making ${service.name} Simple and Stress-Free`,
    `High-Quality ${service.name} Services Guaranteed`,
    `We're Here for Your ${service.name} Needs`,
    `Choose Us for Top-Notch ${service.name} Services`,
    `Your Satisfaction with Our ${service.name} Services is Our Priority`,
    `Efficient ${service.name} Solutions Just a Call Away`,
    `Leading Providers of ${service.name} Services`,
    `Trusted ${service.name} Experts Committed to Excellence`,
    `Your Partner in ${service.name} Services`,
    `Reliable ${service.name} Services You Can Count On`,
    `Dedicated to Outstanding ${service.name} Results`,
    `Expertise in ${service.name} for Your Peace of Mind`,
    `Providing Exceptional ${service.name} Services Every Time`,
    `Your Local ${service.name} Specialists`,
  ];

  // Select a random template
  const serviceTitle = serviceTitleTemplates[Math.floor(Math.random() * serviceTitleTemplates.length)];

  contentEntries.push({
    company_id: companyData.id,
    service_id: service.id,
    title: serviceTitle,
    type: "service",
  });
}

// Location pages and blog posts
for (const service of servicesData) {
  if (!service?.id) continue;
  for (const location of locationsData) {
    if (!location?.id) continue;

    // Expanded array of title templates for location pages
    const locationTitleTemplates = [
      `Expert ${service.name} Services in ${location.location}`,
      `Your Go-To ${service.name} Experts in ${location.location}`,
      `Need ${service.name} in ${location.location}? We've Got You Covered`,
      `Fast and Reliable ${service.name} Services in ${location.location}`,
      `Top-Rated ${service.name} Solutions in ${location.location}`,
      `Trusted ${service.name} Professionals Serving ${location.location}`,
      `Quality ${service.name} Services in ${location.location}`,
      `Dependable ${service.name} Help in ${location.location} When You Need It`,
      `Experienced ${service.name} Specialists in ${location.location}`,
      `Your Local ${service.name} Experts in ${location.location}`,
      `Affordable ${service.name} Services in ${location.location}`,
      `Get the Best ${service.name} in ${location.location}`,
      `Reliable ${service.name} Services Near You in ${location.location}`,
      `Professional ${service.name} Solutions in ${location.location}`,
      `Top Choice for ${service.name} Services in ${location.location}`,
      `Quick and Efficient ${service.name} in ${location.location}`,
      `Making ${service.name} Easy in ${location.location}`,
      `High-Quality ${service.name} Services in ${location.location}`,
      `Your ${service.name} Needs Met in ${location.location}`,
      `Choose Us for ${service.name} in ${location.location}`,
      `Expert Assistance with ${service.name} in ${location.location}`,
      `Leading ${service.name} Providers in ${location.location}`,
      `Trusted ${service.name} Services for ${location.location} Residents`,
      `Dedicated to Excellent ${service.name} in ${location.location}`,
      `Best ${service.name} Solutions in ${location.location}`,
      `Your Trusted Partner for ${service.name} in ${location.location}`,
      `Simplify Your ${service.name} Needs in ${location.location}`,
      `Exceptional ${service.name} Services in ${location.location}`,
      `We're Here for Your ${service.name} Needs in ${location.location}`,
      `Reliable ${service.name} Experts Serving ${location.location}`,
    ];

    // Select a random template
    const locationTitle = locationTitleTemplates[Math.floor(Math.random() * locationTitleTemplates.length)];

    contentEntries.push({
      company_id: companyData.id,
      service_id: service.id,
      location_id: location.id,
      title: locationTitle,
      type: "location",
    });

    // Expanded array of title templates for blog posts, incorporating different blog post types
    const blogTitleTemplates = [
      // Listicles
      `10 Essential Tips for ${service.name} in ${location.location}`,
      `7 Reasons to Choose Professional ${service.name} Services in ${location.location}`,
      `5 Common ${service.name} Mistakes and How to Avoid Them`,
      // How-To Guides
      `How to Get the Best ${service.name} in ${location.location}`,
      `A Step-by-Step Guide to ${service.name} for ${location.location} Homeowners`,
      `How to Save Money on ${service.name} Services in ${location.location}`,
      // Comparison Posts
      `${service.name} Options in ${location.location}: DIY vs. Professional Services`,
      `Comparing Top ${service.name} Providers in ${location.location}`,
      // Case Studies
      `Case Study: Successful ${service.name} Projects in ${location.location}`,
      `Real-Life Examples of ${service.name} Solutions in ${location.location}`,
      // Opinion Pieces
      `Why ${service.name} is Essential for ${location.location} Residents`,
      `The Importance of Quality ${service.name} in ${location.location}`,
      // Interviews
      `An Interview with a ${service.name} Expert in ${location.location}`,
      `Insights from Experienced ${service.name} Professionals in ${location.location}`,
      // Checklists
      `The Ultimate ${service.name} Checklist for ${location.location} Homeowners`,
      `Don't Miss These Steps for Effective ${service.name} in ${location.location}`,
      // Beginner's Guides
      `A Beginner's Guide to ${service.name} in ${location.location}`,
      `Everything You Need to Know About ${service.name} in ${location.location}`,
      // Infographics (Assuming we provide visual content)
      `Infographic: The ${service.name} Process Explained for ${location.location} Residents`,
      // Problem-Solution Posts
      `Common ${service.name} Problems in ${location.location} and How to Fix Them`,
      `How to Overcome ${service.name} Challenges in ${location.location}`,
      // Ultimate Guides
      `The Ultimate Guide to ${service.name} in ${location.location}`,
      `Comprehensive Resource for ${service.name} Services in ${location.location}`,
      // Resource Lists
      `Top 10 Resources for ${service.name} in ${location.location}`,
      `Best Tools and Services for ${service.name} in ${location.location}`,
      // Trend Analysis Posts
      `Latest Trends in ${service.name} for ${location.location}`,
      `What’s New in ${service.name}: ${location.location} Edition`,
      // Reviews
      `An Honest Review of ${service.name} Services in ${location.location}`,
      `Comparing the Best ${service.name} Products for ${location.location} Homes`,
      // Additional Titles
      `Tips for Choosing the Right ${service.name} in ${location.location}`,
      `Why Invest in Professional ${service.name} Services in ${location.location}`,
      `How Weather in ${location.location} Affects Your ${service.name} Needs`,
      `Expert Advice on ${service.name} for ${location.location} Residents`,
      `Avoid These ${service.name} Pitfalls in ${location.location}`,
      `Maximizing the Benefits of ${service.name} in ${location.location}`,
      `Seasonal Guide to ${service.name} in ${location.location}`,
      `Environmental Impact of ${service.name} Choices in ${location.location}`,
      `Frequently Asked Questions About ${service.name} in ${location.location}`,
      `Understanding the Costs of ${service.name} in ${location.location}`,
    ];

    // Select a random template
    const blogTitle = blogTitleTemplates[Math.floor(Math.random() * blogTitleTemplates.length)];

    contentEntries.push({
      company_id: companyData.id,
      service_id: service.id,
      location_id: location.id,
      title: blogTitle,
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
      const totalItems = servicesData.length * (1 + locationsData.length * 2); // Services + (Locations + Blogs) per service
      let completedItems = 0;

      for (const service of servicesData) {
        if (!service?.id) continue;
        const companyInfo = {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: service.name,
          companyId: companyData.id,
        };

        // Generate service page
        await supabase.functions.invoke("generate-content", {
          body: {
            contentType: "service",
            companyInfo,
            serviceId: service.id,
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

          // Generate location page
          await supabase.functions.invoke("generate-content", {
            body: {
              contentType: "location",
              companyInfo: locationInfo,
              serviceId: service.id,
              locationId: location.id,
            },
          });
          completedItems++;
          setProgress(80 + (completedItems / totalItems) * 20);
          toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });

          // Generate blog posts
          await supabase.functions.invoke("generate-content", {
            body: {
              contentType: "blog",
              companyInfo: locationInfo,
              serviceId: service.id,
              locationId: location.id,
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
