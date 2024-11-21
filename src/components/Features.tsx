const Features = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-100">
        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-primary font-semibold">1</span>
        </div>
        <h3 className="font-semibold mb-2 text-neutral-800">Generate Content</h3>
        <p className="text-sm text-neutral-600">
          Automatically create optimized content for your service areas
        </p>
      </div>
      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-100">
        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-primary font-semibold">2</span>
        </div>
        <h3 className="font-semibold mb-2 text-neutral-800">Rank Higher</h3>
        <p className="text-sm text-neutral-600">
          Create standout pages that rank high on search engines
        </p>
      </div>
      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-100">
        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-primary font-semibold">3</span>
        </div>
        <h3 className="font-semibold mb-2 text-neutral-800">Automate SEO</h3>
        <p className="text-sm text-neutral-600">
          Streamline your SEO strategy without technical hassle
        </p>
      </div>
    </div>
  );
};

export default Features;