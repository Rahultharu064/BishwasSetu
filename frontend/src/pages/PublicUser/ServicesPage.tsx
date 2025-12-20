import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layouts/Navbar';
import Footer from '../../components/layouts/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../../Redux/slices/serviceSlice';
import { getAllCategories } from '../../services/categoryService';
import type { AppDispatch, RootState } from '../../Redux/store';
import type { Category } from '../../types/categoryTypes';
import { Service } from '../../types/serviceTypes';

const ServicesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { services, loading } = useSelector((state: RootState) => state.services);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');

  // Fetch Categories for filter dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCats();
  }, []);

  // Fetch Services when filters change
  useEffect(() => {
    const filters = {
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: locationQuery || undefined,
    };
    
    // Update URL params
    const newParams: any = {};
    if (searchQuery) newParams.search = searchQuery;
    if (selectedCategory !== 'all') newParams.category = selectedCategory;
    if (locationQuery) newParams.location = locationQuery;
    setSearchParams(newParams);

    dispatch(fetchServices(filters));
  }, [dispatch, searchQuery, selectedCategory, locationQuery, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger fetch via useEffect dependency
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#1E90FF] to-[#1873CC] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find the Best Services
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Discover top-rated professionals for all your needs
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white shadow-sm sticky top-20 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for services (e.g. Plumbing)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors"
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Location Filter */}
              <div className="flex-1 md:max-w-xs">
                 <div className="relative">
                  <input
                    type="text"
                    placeholder="Location (e.g. Kathmandu)..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border-2 border-[#E9ECEF] focus:border-[#1E90FF] focus:outline-none transition-colors"
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
            </form>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF]"></div>
              </div>
            ) : services.length === 0 ? (
               <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service: Service) => (
                  <div key={service.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                         <span className="inline-block px-3 py-1 bg-blue-50 text-[#1E90FF] text-xs font-semibold rounded-full uppercase tracking-wide">
                          {service.category?.name || 'Service'}
                        </span>
                         <div className="flex items-center text-yellow-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm font-medium text-gray-600">4.8</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{service.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {service.location}
                      </div>

                      <div className="flex items-center pt-4 border-t border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mr-3 overflow-hidden">
                           {service.provider?.avatar ? (
                             <img src={service.provider.avatar} alt={service.provider.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-[#1E90FF] text-white text-xs font-bold">
                                {service.provider?.name?.charAt(0).toUpperCase()}
                             </div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{service.provider?.name}</p>
                          <p className="text-xs text-gray-500 truncate">Verified Provider</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-[#1E90FF] font-bold text-lg">
                        Rs. {service.price}
                      </div>
                      <button className="px-4 py-2 bg-[#1E90FF] hover:bg-[#1873CC] text-white text-sm font-semibold rounded-lg transition-colors">
                        Book Now
                      </button>
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
