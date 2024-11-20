export const serviceTitleTemplates = [
  "Professional {service} Services: Expert Solutions You Can Trust",
  "Premium {service} Services: Quality That Exceeds Expectations",
  "{service} Excellence: Industry-Leading Solutions",
  "{service} Specialists: Your Trusted Industry Partner",
  "Advanced {service} Solutions: Innovation Meets Experience",
  "{service} Experts: Setting the Industry Standard",
  "Certified {service} Services: Professional Excellence Guaranteed",
  "{service} Solutions: Where Quality Meets Reliability",
  "Elite {service} Services: Exceeding Industry Standards",
  "{service} Professionals: Your Success Is Our Priority",
  "{service} Excellence: Proven Results, Trusted Experience",
  "Premier {service} Services: Industry-Leading Solutions",
  "{service} Solutions: Excellence in Every Detail",
  "{service} Specialists: Trusted Industry Leaders",
  "{service} Services: Innovation That Drives Success",
  "{service} Excellence: Setting New Industry Standards",
  "{service} Solutions: Where Experience Meets Innovation",
  "{service} Services: Professional Excellence Delivered",
  "{service} Experts: Your Partner in Success",
  "{service} Solutions: Quality That Speaks for Itself",
  "{service} Services: Excellence Through Innovation",
  "{service} Specialists: Industry-Leading Expertise",
  "{service} Excellence: Professional Solutions That Work",
  "{service} Services: Your Vision, Our Expertise",
  "{service} Solutions: Quality Without Compromise",
  "{service} Experts: Excellence in Every Project",
  "{service} Services: Innovation That Delivers Results",
  "{service} Solutions: Professional Excellence Guaranteed",
  "{service} Specialists: Your Success Story Starts Here",
  "{service} Excellence: Where Quality Meets Innovation"
];

export const locationTitleTemplates = [
  "{service} Services in {location}: Your Local Industry Experts",
  "{location}'s Premier {service} Solutions Provider",
  "Professional {service} Services Serving {location} Community",
  "{service} Excellence in {location}: Local Expertise, Global Standards",
  "{location}'s Trusted {service} Specialists",
  "{service} Solutions for {location}: Local Experience Matters",
  "Expert {service} Services Throughout {location}",
  "{location}'s Leading {service} Service Provider",
  "{service} Excellence: Serving {location} with Pride",
  "{service} Specialists in {location}: Your Local Partner",
  "{location}'s Choice for Professional {service} Services",
  "{service} Solutions: Local Expertise in {location}",
  "{service} Services: {location}'s Trusted Choice",
  "Professional {service} Solutions in {location}",
  "{location}'s Expert {service} Service Provider",
  "{service} Excellence: Local Solutions in {location}",
  "{service} Services: Your {location} Industry Leader",
  "{location}'s Professional {service} Solutions",
  "{service} Specialists: Serving {location} Community",
  "{service} Excellence in Greater {location}",
  "{location}'s Dedicated {service} Service Provider",
  "{service} Solutions: Local Expertise, Global Standards",
  "{service} Services: {location}'s Industry Leader",
  "Professional {service} Excellence in {location}",
  "{location}'s Complete {service} Solutions Provider",
  "{service} Services: Local Experience in {location}",
  "{service} Excellence: Your {location} Solution",
  "{location}'s Professional {service} Specialists",
  "{service} Solutions: Trusted in {location}",
  "{service} Services: {location}'s Premier Choice"
];

export const blogTitleTemplates = [
  "The Ultimate Guide to {service} in {location}: Expert Insights",
  "{service} Best Practices: A Comprehensive Guide for {location}",
  "{location} {service} Guide: Professional Tips and Strategies",
  "Mastering {service} in {location}: Expert Recommendations",
  "{service} Solutions: Essential Tips for {location} Success",
  "The Complete {service} Handbook for {location} Businesses",
  "{service} Excellence: A {location} Success Story",
  "Innovative {service} Strategies for {location} Growth",
  "{service} Insights: {location}'s Professional Guide",
  "Maximizing {service} Success in {location}: Expert Guide",
  "{service} Solutions: {location}'s Comprehensive Resource",
  "Advanced {service} Techniques for {location} Success",
  "{service} Mastery: Essential Guide for {location}",
  "{location}'s Guide to Professional {service} Success",
  "{service} Excellence: Strategies for {location} Growth",
  "The {location} Professional's Guide to {service}",
  "{service} Innovation: {location}'s Success Blueprint",
  "Essential {service} Practices for {location} Excellence",
  "{service} Success Stories from {location}: A Guide",
  "{location}'s Complete Resource for {service} Excellence",
  "Professional {service} Insights: {location} Edition",
  "{service} Solutions: The {location} Success Guide",
  "Transforming {service} Success in {location}",
  "{service} Best Practices: {location} Industry Guide",
  "{location}'s Ultimate {service} Success Manual",
  "{service} Excellence: The {location} Advantage",
  "Strategic {service} Solutions for {location} Growth",
  "{service} Innovation: {location}'s Expert Guide",
  "{location}'s Professional Guide to {service} Success",
  "{service} Mastery: {location}'s Complete Resource"
];

export const getRandomTemplate = (templates: string[], replacements: Record<string, string>) => {
  const template = templates[Math.floor(Math.random() * templates.length)];
  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), value),
    template
  );
};