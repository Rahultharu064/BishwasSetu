import React, { useEffect, useState } from 'react';

const CommunityHighlights: React.FC = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    providers: 0,
    vouches: 0,
  });

  const finalStats = {
    bookings: 5000,
    providers: 500,
    vouches: 12000,
  };

  useEffect(() => {
    // Animate counters
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        bookings: Math.floor(finalStats.bookings * progress),
        providers: Math.floor(finalStats.providers * progress),
        vouches: Math.floor(finalStats.vouches * progress),
      });

      if (currentStep >= steps) {
        setStats(finalStats);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const highlights = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      value: stats.bookings.toLocaleString(),
      label: 'Total Bookings',
      color: 'from-[#1E90FF] to-[#1873CC]',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      value: `${stats.providers}+`,
      label: 'Trusted Vendors',
      color: 'from-[#28A745] to-[#218838]',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
      value: `${stats.vouches.toLocaleString()}+`,
      label: 'Community Vouches',
      color: 'from-[#FFD700] to-[#E6C200]',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#212529] mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-[#6C757D] max-w-2xl mx-auto">
            Join our growing community of satisfied customers and verified service providers
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-lift animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-5`}></div>
              
              <div className="relative flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className={`w-20 h-20 flex items-center justify-center bg-gradient-to-br ${highlight.color} rounded-2xl text-white shadow-lg`}>
                  {highlight.icon}
                </div>

                {/* Value */}
                <div>
                  <p className="text-4xl md:text-5xl font-bold text-[#212529] mb-2">
                    {highlight.value}
                  </p>
                  <p className="text-lg text-[#6C757D] font-medium">
                    {highlight.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial Section */}
        <div className="mt-16 bg-gradient-to-br from-[#F0F8FF] to-[#F8F9FA] rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <svg className="w-12 h-12 text-[#1E90FF] mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-xl md:text-2xl text-[#212529] font-medium mb-6 leading-relaxed">
              "BishwasSetu made it so easy to find a reliable plumber in my neighborhood. The community reviews gave me confidence, and the service was excellent!"
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E90FF] to-[#1873CC] rounded-full flex items-center justify-center text-white font-bold text-lg">
                SK
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#212529]">Suman Karki</p>
                <p className="text-sm text-[#6C757D]">Kathmandu, Nepal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityHighlights;
