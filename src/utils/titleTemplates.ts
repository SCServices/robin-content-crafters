export const serviceTitleTemplates = [
  `Get Reliable {service} Services Today`,
  `Your Trusted Source for {service}`,
  `Affordable {service} Solutions Near You`,
  `Expert Help with {service}`,
  `Top Choice for {service} Needs`,
  `Professional {service} Services You Can Trust`,
  `Quality {service} at Great Prices`,
  `Experienced {service} Specialists Ready to Help`,
  `Quick and Easy {service} Solutions`,
  `Dependable {service} Services for Your Home`,
  `Simplify Your {service} Needs Today`,
  `Trusted {service} Professionals at Your Service`,
  `Exceptional {service} Services for You`,
  `Best {service} Services in Town`,
  `Friendly and Reliable {service} Experts`,
  `Your Go-To Team for {service} Services`,
  `Making {service} Simple and Stress-Free`,
  `High-Quality {service} Services Guaranteed`,
  `We're Here for Your {service} Needs`,
  `Choose Us for Top-Notch {service} Services`,
];

export const locationTitleTemplates = [
  `Expert {service} Services in {location}`,
  `Your Go-To {service} Experts in {location}`,
  `Need {service} in {location}? We've Got You Covered`,
  `Fast and Reliable {service} Services in {location}`,
  `Top-Rated {service} Solutions in {location}`,
  `Trusted {service} Professionals Serving {location}`,
  `Quality {service} Services in {location}`,
  `Dependable {service} Help in {location} When You Need It`,
  `Experienced {service} Specialists in {location}`,
  `Your Local {service} Experts in {location}`,
  `Affordable {service} Services in {location}`,
  `Get the Best {service} in {location}`,
  `Reliable {service} Services Near You in {location}`,
  `Professional {service} Solutions in {location}`,
  `Top Choice for {service} Services in {location}`,
];

export const blogTitleTemplates = [
  `10 Essential Tips for {service} in {location}`,
  `7 Reasons to Choose Professional {service} Services in {location}`,
  `5 Common {service} Mistakes and How to Avoid Them`,
  `How to Get the Best {service} in {location}`,
  `A Step-by-Step Guide to {service} for {location} Homeowners`,
  `How to Save Money on {service} Services in {location}`,
  `{service} Options in {location}: DIY vs. Professional Services`,
  `Comparing Top {service} Providers in {location}`,
  `Case Study: Successful {service} Projects in {location}`,
  `Real-Life Examples of {service} Solutions in {location}`,
  `Why {service} is Essential for {location} Residents`,
  `The Importance of Quality {service} in {location}`,
  `An Interview with a {service} Expert in {location}`,
  `Insights from Experienced {service} Professionals in {location}`,
  `The Ultimate {service} Checklist for {location} Homeowners`,
];

export const getRandomTemplate = (templates: string[], replacements: Record<string, string>) => {
  const template = templates[Math.floor(Math.random() * templates.length)];
  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), value),
    template
  );
};