import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import Button from '../../ui/Button';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  avgPrice: string;
  avgDuration: string;
  trustScore: number;
  providerCount: number;
}

const FindServices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'Plumbing Services',
        category: 'Home Repair',
        description: 'Professional plumbing repairs, installations, and maintenance',
        avgPrice: '₹500-2000',
        avgDuration: '1-3 hours',
        trustScore: 4.7,
        providerCount: 25
      },
      {
        id: '2',
        name: 'Electrical Work',
        category: 'Home Repair',
        description: 'Electrical repairs, wiring, and installations',
        avgPrice: '₹300-1500',
        avgDuration: '1-4 hours',
        trustScore: 4.8,
        providerCount: 18
      },
      {
        id: '3',
        name: 'House Cleaning',
        category: 'Cleaning',
        description: 'Deep cleaning services for homes and offices',
        avgPrice: '₹800-3000',
        avgDuration: '2-4 hours',
        trustScore: 4.6,
        providerCount: 32
      },
      {
        id: '4',
        name: 'Carpentry',
        category: 'Home Repair',
        description: 'Woodwork, furniture repair, and custom installations',
        avgPrice: '₹600-2500',
        avgDuration: '2-6 hours',
        trustScore: 4.9,
        providerCount: 15
      }
    ];
    setServices(mockServices);
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'home-repair', label: 'Home Repair' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'installation', label: 'Installation' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category.toLowerCase().replace(' ', '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Find Services</h1>
        <p className="text-gray-600 mt-1">Discover trusted service providers in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <Button className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.category}</p>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium ml-1">{service.trustScore}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{service.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Average Price:</span>
                <span className="font-medium">{service.avgPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{service.avgDuration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Providers:</span>
                <span className="font-medium">{service.providerCount} available</span>
              </div>
            </div>

            <Button className="w-full">
              View Providers
            </Button>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default FindServices;
