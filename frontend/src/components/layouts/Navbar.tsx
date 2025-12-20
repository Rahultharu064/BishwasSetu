import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../ui/Button';
import type { RootState } from '../../Redux/store';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, profile } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Providers', path: '/providers' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-40 h-10 flex items-center">
              <span className="text-2xl font-bold text-[#1E90FF]">Bishwas</span>
              <span className="text-2xl font-bold text-[#212529]">Setu</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-base font-semibold transition-all duration-300 group ${
                  isActive(link.path)
                    ? 'text-[#1E90FF]'
                    : 'text-[#212529] hover:text-[#1E90FF]'
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#1E90FF] transition-transform duration-300 origin-left ${
                    isActive(link.path)
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
               <Link to="/profile">
                  <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                        {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-700 text-sm leading-tight">{profile?.name || 'User'}</span>
                        <span className="text-[10px] text-gray-500 font-medium leading-tight">{profile?.role}</span>
                    </div>
                  </div>
               </Link>
            ) : (
                <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-[120px]">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md" className="w-[140px]">
                    Register
                  </Button>
                </Link>
                </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-8 h-8 text-[#212529]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-[#212529]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col space-y-6 px-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-[#1E90FF]'
                    : 'text-[#212529] hover:text-[#1E90FF]'
                }`}
              >
                {link.name}
              </Link>
            ))}
             {isAuthenticated && (
                <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-semibold transition-colors ${
                  isActive('/profile')
                    ? 'text-[#1E90FF]'
                    : 'text-[#212529] hover:text-[#1E90FF]'
                }`}
              >
                My Profile
              </Link>
             )}
          </div>

          <div className="mt-auto p-6 space-y-4">
            {isAuthenticated ? (
                 <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                        Go to Profile
                    </Button>
                </Link>
            ) : (
                <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                    Login
                </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                    Register
                </Button>
                </Link>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
