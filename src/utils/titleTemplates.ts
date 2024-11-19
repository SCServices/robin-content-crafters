export const generateTitles = (serviceName: string, location: string, companyName: string) => {
  // Service page title
  const serviceTitle = `Get the Best ${serviceName} in ${location}`;
  
  // Meta description
  const metaDescription = `Professional ${serviceName} services in ${location} by ${companyName}. Our experienced team provides reliable, efficient, and affordable solutions tailored to your needs. Contact us today for expert ${serviceName.toLowerCase()} services you can trust.`;
  
  return { title: serviceTitle, metaDescription };
};