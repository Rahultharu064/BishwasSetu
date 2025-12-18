import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const CTABanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-[#1E90FF] to-[#1873CC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Join thousands of satisfied customers finding trusted service providers in their community. 
              Start your journey with BishwasSetu today!
            </p>
          </div>

          {/* Right CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="white"
              size="lg"
              onClick={() => navigate('/services')}
              className="w-full sm:w-auto min-w-[180px]"
            >
              Find Services
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register?role=provider')}
              className="w-full sm:w-auto min-w-[180px] border-white text-white hover:bg-white hover:text-[#1E90FF]"
            >
              Become a Provider
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white font-semibold">Quick Response</p>
            <p className="text-white/80 text-sm">Get quotes within 24 hours</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-white font-semibold">100% Verified</p>
            <p className="text-white/80 text-sm">All providers are vetted</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-white font-semibold">24/7 Support</p>
            <p className="text-white/80 text-sm">We're here to help anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
