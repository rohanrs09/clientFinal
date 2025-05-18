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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* API Tester for debugging (only visible in development) */}
        {process.env.NODE_ENV === 'development' && <ApiTester />}
        
        {/* API Connection Status */}
        {connectionStatus && (
          <div className={`mb-4 p-3 rounded ${connectionStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {connectionStatus}
          </div>
        )}
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-12 md:px-12 text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Find Your Perfect Stay
            </h1>
            <p className="mt-4 text-lg text-blue-100 max-w-3xl">
              Search from our vast selection of hotels and find the perfect accommodation for your next trip.
            </p>
            
            {/* Search Form */}
            <div className="mt-8">
              <form onSubmit={handleSearch} className="sm:flex">
                <div className="min-w-0 flex-1">
                  <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                      placeholder="Location (city, region)"
                    />
                    <input
                      type="text"
                      name="amenities"
                      id="amenities"
                      value={searchAmenities}
                      onChange={(e) => setSearchAmenities(e.target.value)}
                      className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                      placeholder="Amenities (wifi, pool, etc.)"
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-3">
                  <Button 
                    type="submit" 
                    variant="light" 
                    className="w-full"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Hotels List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Our Featured Hotels
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hotels found. Please try a different search.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {hotels.map((hotel) => (
                <div key={hotel.hotelID} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="font-bold text-white text-3xl px-4 text-center">{hotel.name}</div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-700 font-medium">{hotel.location}</p>
                    </div>
                    
                    <div className="mb-3">
                      {renderStarRating(hotel.rating)}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Amenities:</h4>
                      {renderAmenities(hotel.amenities) || <p className="text-sm text-gray-500">No amenities listed</p>}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{hotel.rooms?.length || 0} rooms available</p>
                      </div>
                      <Link to={`/hotels/${hotel.hotelID}`}>
                        <Button variant="primary" className="px-4">
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
    </div>
  );
};

export default Home; 