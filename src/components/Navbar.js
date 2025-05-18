import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isAdmin, isManager, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Link styles
  const linkBaseStyles = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
  const desktopLinkStyles = `${linkBaseStyles} hover:bg-blue-700`;
  const mobileLinkStyles = `block ${linkBaseStyles} hover:bg-blue-700`;
  const activeLinkStyles = "bg-blue-700";

  return (
    <nav className={`${isScrolled ? 'bg-blue-700 shadow-lg' : 'bg-blue-600'} text-white sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-bold text-xl tracking-tight">Hotel Booking</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link 
              to="/" 
              className={`${desktopLinkStyles} ${isActive('/') ? activeLinkStyles : ''}`}
            >
              Home
            </Link>
            
            {currentUser ? (
              <>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className={`${desktopLinkStyles} ${isActive('/admin') ? activeLinkStyles : ''}`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                {isManager() && (
                  <Link 
                    to="/manager" 
                    className={`${desktopLinkStyles} ${isActive('/manager') ? activeLinkStyles : ''}`}
                  >
                    Manager Dashboard
                  </Link>
                )}
                
                {isGuest() && (
                  <>
                    <Link 
                      to="/guest" 
                      className={`${desktopLinkStyles} ${isActive('/guest') ? activeLinkStyles : ''}`}
                    >
                      My Dashboard
                    </Link>
                    <Link 
                      to="/bookings" 
                      className={`${desktopLinkStyles} ${isActive('/bookings') ? activeLinkStyles : ''}`}
                    >
                      My Bookings
                    </Link>
                  </>
                )}
                
                {/* Profile dropdown */}
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <span className="ml-2">{currentUser.name}</span>
                      <svg className={`ml-1 h-5 w-5 transition-transform duration-200 ${profileDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {profileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transform transition-all duration-200 ease-out">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`${desktopLinkStyles} ${isActive('/login') ? activeLinkStyles : ''}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <svg 
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300 ease-in-out`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            to="/" 
            className={`${mobileLinkStyles} ${isActive('/') ? activeLinkStyles : ''}`}
          >
            Home
          </Link>
          
          {currentUser ? (
            <>
              {isAdmin() && (
                <Link 
                  to="/admin" 
                  className={`${mobileLinkStyles} ${isActive('/admin') ? activeLinkStyles : ''}`}
                >
                  Admin Dashboard
                </Link>
              )}
              
              {isManager() && (
                <Link 
                  to="/manager" 
                  className={`${mobileLinkStyles} ${isActive('/manager') ? activeLinkStyles : ''}`}
                >
                  Manager Dashboard
                </Link>
              )}
              
              {isGuest() && (
                <>
                  <Link 
                    to="/guest" 
                    className={`${mobileLinkStyles} ${isActive('/guest') ? activeLinkStyles : ''}`}
                  >
                    My Dashboard
                  </Link>
                  <Link 
                    to="/bookings" 
                    className={`${mobileLinkStyles} ${isActive('/bookings') ? activeLinkStyles : ''}`}
                  >
                    My Bookings
                  </Link>
                </>
              )}
              
              <Link 
                to="/profile" 
                className={`${mobileLinkStyles} ${isActive('/profile') ? activeLinkStyles : ''}`}
              >
                Profile
              </Link>
              
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`${mobileLinkStyles} ${isActive('/login') ? activeLinkStyles : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-gray-100 transition-colors duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 