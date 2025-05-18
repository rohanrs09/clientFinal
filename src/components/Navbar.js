import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isAdmin, isManager, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl">Hotel Booking System</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center">
            {currentUser ? (
              <>
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Home
                </Link>
                
                {isAdmin() && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Admin Dashboard
                  </Link>
                )}
                
                {isManager() && (
                  <Link to="/manager" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Manager Dashboard
                  </Link>
                )}
                
                {isGuest() && (
                  <>
                    <Link to="/guest" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                      My Dashboard
                    </Link>
                    <Link to="/bookings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                      My Bookings
                    </Link>
                  </>
                )}
                
                <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Profile
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Login
                </Link>
                <Link to="/register" className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-gray-200">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Home
            </Link>
            
            {currentUser ? (
              <>
                {isAdmin() && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                    Admin Dashboard
                  </Link>
                )}
                
                {isManager() && (
                  <Link to="/manager" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                    Manager Dashboard
                  </Link>
                )}
                
                {isGuest() && (
                  <>
                    <Link to="/guest" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                      My Dashboard
                    </Link>
                    <Link to="/bookings" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                      My Bookings
                    </Link>
                  </>
                )}
                
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                  Profile
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500 hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-white text-blue-600 hover:bg-gray-200">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 