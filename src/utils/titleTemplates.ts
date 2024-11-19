export const getServiceTitleTemplate = (service: string, location: string) => {
  const templates = [
    `Get the Best ${service} in ${location}`,
    `Professional ${service} Services in ${location}`,
    `Expert ${service} Solutions for ${location} Residents`,
    `Top-Rated ${service} Services in ${location}`,
    `Reliable ${service} Services in ${location}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

export const getMetaDescription = (service: string, location: string) => {
  const templates = [
    `${service} Services in ${location} - Professional installation, repair, and maintenance services. Expert technicians, competitive pricing, and outstanding customer service. Schedule your service today!`,
    `Looking for reliable ${service} in ${location}? Our experienced team provides comprehensive solutions tailored to your needs. Fast response times and quality guaranteed.`,
    `Trust our skilled professionals for all your ${service} needs in ${location}. We offer complete solutions with upfront pricing and satisfaction guaranteed. Contact us for expert service!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};