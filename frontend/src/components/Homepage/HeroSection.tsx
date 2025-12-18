import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[600px] lg:min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-[#F0F8FF] via-white to-[#F8F9FA] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Left Content - 60% */}
          <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-[40px] font-bold leading-tight text-[#212529]">
              Find <span className="text-[#1E90FF]">Trusted</span> Home Service
              <br />
              Providers in Your Community
            </h1>
            
            <p className="text-lg md:text-xl text-[#6C757D] max-w-xl body-large">
              Connect with verified service providers recommended by your neighbors. 
              Quality services, transparent pricing, and community-backed trust.
            </p>

            {/* Search Bar */}
            <div className="max-w-[500px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for services (e.g., plumber, electrician...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-[50px] px-6 pr-12 rounded-xl border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors text-base"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#1E90FF] text-white rounded-lg hover:bg-[#1873CC] transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/services')}
                className="w-full sm:w-[200px]"
              >
                Find Trusted Vendors
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register?role=provider')}
                className="w-full sm:w-[180px]"
              >
                Join as Vendor
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-[#28A745]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#6C757D] font-medium">Verified Providers</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[#6C757D] font-medium">Community Trusted</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-[#1E90FF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#6C757D] font-medium">Secure Bookings</span>
              </div>
            </div>
          </div>

          {/* Right Illustration - 40% */}
          <div className="lg:col-span-2 relative animate-slide-in-right animation-delay-200">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Illustration Placeholder */}
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-[#1E90FF]/10 to-[#FFD700]/10 flex items-center justify-center p-8">
                <svg className="w-full h-full text-[#1E90FF]/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-1.26-6-5.42-6-9V8.5l6-3.15 6 3.15V11c0 3.58-2.14 7.74-6 9z" />
                  <path d="M10.5 14.5l-2-2L7 14l3.5 3.5L17 11l-1.5-1.5z" />
                </svg>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#28A745] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#212529]">500+</p>
                    <p className="text-xs text-[#6C757D]">Verified Providers</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#212529]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#212529]">4.8/5</p>
                    <p className="text-xs text-[#6C757D]">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E90FF]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default HeroSection;
