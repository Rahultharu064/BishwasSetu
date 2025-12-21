import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star } from "lucide-react";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";
import Button from "../../components/ui/Button";
import { getServiceStats } from "../../services/serviceService";

const categories = ["All", "Home Repair", "Cleaning", "Home Improvement", "Moving", "Security", "Home Maintenance", "Outdoor"];

const ServicesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServiceStats();
        if (Array.isArray(data)) {
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);


  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-background py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Our Services
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse our wide range of home services. All providers are verified and community-trusted.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                      ? "bg-[#1E90FF] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF]"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link to={`/providers?service=${service.name.toLowerCase()}`}>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                          <div className="text-5xl mb-4">{service.icon}</div>
                          <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-[#1E90FF] transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {service.providers} providers available
                          </p>
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-medium text-foreground">{service.rating}</span>
                            <span className="text-muted-foreground text-sm ml-1">avg. rating</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">No services found matching your criteria.</p>
                    <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;

