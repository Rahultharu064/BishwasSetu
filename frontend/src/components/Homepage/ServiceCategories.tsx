import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService';
import type { Category } from '../../types/categoryTypes';

const ServiceCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        // Show top 6 categories
        setCategories(data.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const displayCategories = categories;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF]"></div>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#212529] mb-4">
            Popular Service Categories
          </h2>
          <p className="text-lg text-[#6C757D] max-w-2xl mx-auto">
            Browse our wide range of trusted service providers
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {displayCategories.map((category, index) => (
            <div
              key={category.id}
              onClick={() => navigate(`/services?category=${category.id}`)}
              className="group bg-white rounded-2xl p-6 border-2 border-[#E9ECEF] hover:border-[#1E90FF] cursor-pointer transition-all duration-300 card-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#1E90FF]/10 to-[#1E90FF]/5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">{category.icon || '🔧'}</span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-semibold text-[#212529] group-hover:text-[#1E90FF] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[#6C757D] mt-2">
                    {category.description || 'Quality service providers'}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6 text-[#1E90FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center space-x-2 px-8 py-3 bg-[#1E90FF] text-white font-semibold rounded-lg hover:bg-[#1873CC] hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <span>View All Services</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
