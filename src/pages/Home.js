import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import hotelService from '../services/hotelService';
import api from '../services/api';
import ApiTester from '../components/ApiTester';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchAmenities, setSearchAmenities] = useState('');
  
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        // Test connection using a simple GET request
        await api.get('/Hotels');
        setConnectionStatus('✅ Backend connection successful');
      } catch (err) {
        console.error('API Connection Error:', err);
        setConnectionStatus(`❌ Backend connection failed: ${err.message}`);
      }
    };
    
    testApiConnection();
    
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await hotelService.getAllHotels();
        if (response.success) {
          setHotels(response.data);
        } else {
          setError('Failed to fetch hotels. Please try again later.');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error fetching hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, []);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await hotelService.searchHotels(searchLocation, searchAmenities);
      if (response.success) {
        setHotels(response.data);
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to render star ratings
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) - fullStars >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < fullStars ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : hasHalfStar && i === fullStars ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <defs>
                  <linearGradient id="half-fill" x1="0" x2="100%" y1="0" y2="0">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#D1D5DB" />
                  </linearGradient>
                </defs>
                <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </span>
        ))}
        {rating && <span className="ml-1 text-gray-600 text-sm">({rating.toFixed(1)})</span>}
      </div>
    );
  };
  
  // Helper function to display amenities as badges
  const renderAmenities = (amenitiesString) => {
    if (!amenitiesString) return null;
    
    const amenitiesList = amenitiesString.split(',').map(item => item.trim());
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {amenitiesList.map((amenity, index) => (
          <span 
            key={index} 
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
          >
            {amenity}
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-800 overflow-hidden">
        {/* Background pattern */}
        <div className="hidden sm:block sm:absolute sm:inset-0">
          <svg className="absolute bottom-0 right-0 transform translate-x-1/2 mb-48 text-blue-500 lg:top-0 lg:mt-28 lg:mb-0 xl:transform-none xl:translate-x-0 opacity-10" width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
            <defs>
              <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-white" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
          </svg>
        </div>
        
        <div className="pt-10 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Find Your Perfect</span>
                  <span className="block text-indigo-200">Hotel Stay</span>
                </h1>
                <p className="mt-3 text-base text-white sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Discover amazing places to stay around the world with our curated selection of luxury hotels, cozy apartments, and unique accommodations.
                </p>
              </div>
              
              <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6">
                <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden shadow-xl">
                  <div className="px-4 py-8 sm:px-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Search Hotels
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        Find the perfect accommodation for your next trip
                      </p>
                    </div>
                    
                    <form className="mt-6 space-y-4" onSubmit={handleSearch}>
                      <div>
                        <label htmlFor="location" className="sr-only">Location</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <input
                            id="location"
                            name="location"
                            type="text"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                            placeholder="Where are you going?"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="amenities" className="sr-only">Amenities</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <input
                            id="amenities"
                            name="amenities"
                            type="text"
                            value={searchAmenities}
                            onChange={(e) => setSearchAmenities(e.target.value)}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                            placeholder="Amenities (e.g. Pool, WiFi, Gym)"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Button 
                          type="submit" 
                          variant="gradient-blue" 
                          fullWidth 
                          size="lg"
                          rounded="md"
                          loading={loading}
                          loadingText="Searching..."
                        >
                          Search Hotels
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hotels List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          {searchLocation && searchAmenities ? 'Search Results' : 'Featured Hotels'}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : hotels.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded-lg text-center">
            <svg className="h-12 w-12 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No hotels found</h3>
            <p className="text-yellow-700">Try adjusting your search criteria or explore our featured hotels.</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <div 
                key={hotel.hotelID}
                className="group bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white px-4 text-center">{hotel.name}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-600">{hotel.location}</p>
                  </div>
                  
                  {hotel.amenities && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.split(',').map((amenity, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                          >
                            {amenity.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">{hotel.rooms?.length || 0} rooms available</p>
                    </div>
                    <Link to={`/hotels/${hotel.hotelID}`}>
                      <Button 
                        variant="primary" 
                        size="sm"
                        rounded="md"
                        className="group-hover:bg-blue-700 transition-colors duration-300"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 