import React from 'react';
import Navbar from '../../components/layouts/Navbar';
import Footer from '../../components/layouts/Footer';
import HeroSection from '../../components/Homepage/HeroSection';
import ServiceCategories from '../../components/Homepage/ServiceCategories';
import WhyBishwasSetu from '../../components/Homepage/WhyBishwasSetu';
import CommunityHighlights from '../../components/Homepage/CommunityHighlights';
import CTABanner from '../../components/Homepage/CTABanner';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main>
        <HeroSection />
        <ServiceCategories />
        <WhyBishwasSetu />
        <CommunityHighlights />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;
