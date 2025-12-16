import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { getAllCategories } from "../../services/categoryService";
import type { Category } from "../../types/categoryTypes";

/* ---------------- ANIMATIONS ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

const getCategoryIcon = (name: string, icon?: string) => {
  if (icon) {
    // Check if it's inline SVG content
    if (icon.trim().startsWith('<svg') && icon.trim().endsWith('</svg>')) {
      return (
        <div
          className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
          dangerouslySetInnerHTML={{
            __html: icon.replace('<svg', '<svg class="w-6 h-6 text-white"')
          }}
        />
      );
    }
    // Check if it's an SVG URL
    else if (icon.toLowerCase().endsWith('.svg')) {
      return (
        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <img
            src={icon}
            alt={`${name} icon`}
            className="w-6 h-6 text-white filter brightness-0 invert"
          />
        </div>
      );
    } else {
      // For other image formats, use background-image
      return (
        <div
          className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
          style={{ backgroundImage: `url(${icon})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
      );
    }
  }
  const firstLetter = name.charAt(0).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
      <span className="font-bold text-lg text-white">{firstLetter}</span>
    </div>
  );
};

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 text-center">
        <p className="text-muted-foreground">Loading categories...</p>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="container-custom">
        {/* ---------- HEADER ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              Explore Services
            </span>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              Browse by Category
            </h2>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* ---------- CATEGORY GRID ---------- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <Link
                to={`/services?category=${category.id}`}
                className="block bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group flex flex-col items-center text-center"
              >
                {/* ICON */}
                <div className="mb-3">
                  {getCategoryIcon(category.name, category.icon)}
                </div>

                {/* NAME FROM BACKEND */}
                <h3 className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryList;
