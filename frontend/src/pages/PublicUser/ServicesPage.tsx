import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layouts/Navbar';
import Footer from '../../components/layouts/Footer';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../types/categoryTypes';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#1E90FF] to-[#1873CC] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Our Services
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Browse through our wide range of trusted service providers
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors"
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF]"></div>
                <p className="mt-4 text-[#6C757D]">Loading services...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-[#6C757D] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl text-[#6C757D]">No services found</p>
                <p className="text-[#6C757D] mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => navigate(`/providers?category=${category.id}`)}
                    className="group bg-white rounded-2xl p-6 border-2 border-[#E9ECEF] hover:border-[#1E90FF] cursor-pointer transition-all duration-300 card-lift animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Icon */}
                      <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[#1E90FF]/10 to-[#1E90FF]/5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <span className="text-5xl">{category.icon || '🔧'}</span>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-xl font-semibold text-[#212529] group-hover:text-[#1E90FF] transition-colors mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm text-[#6C757D] leading-relaxed">
                          {category.description || 'Quality service providers'}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-center space-x-4 text-sm text-[#6C757D] pt-2">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          <span>{category.providerCount || 0} providers</span>
                        </div>
                        {category.avgTrustScore && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{category.avgTrustScore.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-[#1E90FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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

export default ServicesPage;
