export const serviceTitleTemplates = [
  "Professional {service} Services: Expert Solutions You Can Trust",
  "Premium {service} Services: Quality That Exceeds Expectations",
  "{service} Specialists: Your Trusted Industry Partner",
  "Advanced {service} Solutions: Innovation Meets Experience",
  "{service} Experts: Setting the Industry Standard",
  "Certified {service} Services: Professional Excellence Guaranteed",
  "{service} Solutions: Where Quality Meets Reliability",
  "Elite {service} Services: Exceeding Industry Standards",
  "{service} Professionals: Your Success Is Our Priority",
  "{service} Excellence: Proven Results, Trusted Experience"
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
  "{service} Specialists in {location}: Your Local Partner"
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
  "Maximizing {service} Success in {location}: Expert Guide"
];

export const getRandomTemplate = (templates: string[], replacements: Record<string, string>) => {
  const template = templates[Math.floor(Math.random() * templates.length)];
  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), value),
    template
  );
};