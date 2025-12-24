import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layouts/Navbar';
import Footer from '../../components/layouts/Footer';
import Button from '../../components/ui/Button';
import { getAllVerifiedProviders } from '../../services/providerService';

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
  trustScore: number;
  image: string;
  services: string[];
  priceRange: string;
}

const ProvidersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await getAllVerifiedProviders();
        const transformedProviders: Provider[] = response.data.map((provider: any) => ({
          id: provider.id.toString(),
          name: provider.legalName || provider.user.name,
          category: provider.category?.name || 'Uncategorized',
          rating: 4.8, // Placeholder - would need review system
          reviews: 0, // Placeholder - would need review system
          location: provider.serviceDistrict || provider.user.district || 'Unknown',
          verified: provider.verificationStatus === 'VERIFIED',
          trustScore: provider.trustScore || 85,
          image: provider.profilePhotoUrl ? provider.profilePhotoUrl : '👨‍🔧', // Fallback emoji
          services: provider.service.map((s: any) => s.title) || [],
          priceRange: provider.price ? `NPR ${provider.price}` : 'Price on request',
        }));
        setProviders(transformedProviders);
      } catch (error) {
        console.error('Failed to fetch providers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const categories = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Painting', 'Gardening'];
  const locations = ['All', 'Kathmandu', 'Lalitpur', 'Bhaktapur'];

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || provider.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLocation = selectedLocation === 'all' || provider.location === selectedLocation;
    const matchesTrustScore = provider.trustScore >= minTrustScore;
    return matchesSearch && matchesCategory && matchesLocation && matchesTrustScore;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#1E90FF] to-[#1873CC] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Trusted Service Providers
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Connect with verified professionals in your community
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-white shadow-sm sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Search Bar - Fixed width 400px on desktop */}
              <div className="w-full lg:w-[400px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search providers or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors"
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 px-4 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors bg-white cursor-pointer"
                  aria-label="Filter by category"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-12 px-4 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors bg-white cursor-pointer"
                  aria-label="Filter by location"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc.toLowerCase()}>
                      {loc}
                    </option>
                  ))}
                </select>

                <select
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="h-12 px-4 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors bg-white cursor-pointer"
                  aria-label="Filter by trust score"
                >
                  <option value={0}>All Trust Scores</option>
                  <option value={90}>90+ Trust Score</option>
                  <option value={95}>95+ Trust Score</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Providers Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[#6C757D]">
                Found <span className="font-semibold text-[#212529]">{filteredProviders.length}</span> providers
              </p>
            </div>

            {filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-[#6C757D] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl text-[#6C757D]">No providers found</p>
                <p className="text-[#6C757D] mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider, index) => (
                  <div
                    key={provider.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#E9ECEF] hover:border-[#E9ECEF] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Provider Header Background */}
                    <div className="h-24 bg-gradient-to-r from-[#1E90FF]/10 to-[#1E90FF]/5 relative">
                      {/* Verified Badge - Top Right */}
                      {provider.verified && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-[#28A745] rounded-full flex items-center justify-center shadow-md z-10" title="Verified Provider">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Provider Info Container */}
                    <div className="px-6 pb-6 -mt-12 relative">
                      {/* Image - Circle 120x120 */}
                      <div className="w-[120px] h-[120px] bg-white rounded-full p-2 mx-auto shadow-md mb-4 flex items-center justify-center border-4 border-white">
                        {provider.image.startsWith('/') ? (
                          <img
                            src={(() => {
                              const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5009';
                              // Remove leading slash from image to avoid double slash if needed, or join cleanly
                              // But provider.image usually starts with / (e.g. /uploads/...)
                              // So we want backendUrl + provider.image
                              const imageUrl = `${backendUrl}${provider.image}`;
                              return imageUrl;
                            })()}
                            onError={(e) => {
                              console.error('Failed to load image:', provider.image);
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120?text=Error';
                            }}
                            alt={provider.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#f8f9fa] rounded-full flex items-center justify-center text-5xl">
                            {provider.image}
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-[#212529] mb-1 group-hover:text-[#1E90FF] transition-colors">
                          {provider.name}
                        </h3>
                        <p className="text-[#1E90FF] font-medium text-sm mb-3">{provider.category}</p>

                        {/* Rating and Location */}
                        <div className="flex items-center justify-center gap-4 mb-4 text-sm text-[#6C757D]">
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold text-[#212529]">{provider.rating}</span>
                            <span>({provider.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{provider.location}</span>
                          </div>
                        </div>

                        {/* Trust Score */}
                        <div className="mb-4 text-left">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[#6C757D]">Trust Score</span>
                            <span className="font-semibold text-[#28A745]">{provider.trustScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#28A745] rounded-full transition-all duration-500"
                              style={{ width: `${provider.trustScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Services Tag (First 2 only) */}
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {provider.services.slice(0, 2).map((service, idx) => (
                            <span key={idx} className="px-2 py-1 bg-[#F0F8FF] text-[#1E90FF] text-xs rounded-md">
                              {service}
                            </span>
                          ))}
                          {provider.services.length > 2 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">+{provider.services.length - 2}</span>
                          )}
                        </div>

                        {/* Price Range */}
                        <p className="text-sm text-[#6C757D] mb-5">
                          {provider.priceRange}
                        </p>

                        {/* Hover Action Button - Replaces "View Profile" on hover conceptually, but let's keep it clean as per prompt: show quick actions */}
                        <div className="pt-2 border-t border-[#E9ECEF] flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/provider/${provider.id}`)}
                            className="flex-1 text-sm"
                          >
                            Profile
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/booking/${provider.id}`)}
                            className="flex-1 text-sm shadow-md hover:shadow-lg"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProvidersPage;
