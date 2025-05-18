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
        <div className="bg-blue-600 rounded-lg shadow-xl overflow-hidden mb-8">
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
          <h2 className="text-2xl font-bold text-gray-900">
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
                <Card key={hotel.hotelID} className="h-full flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                    <p className="mt-2 text-gray-600">{hotel.location}</p>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Amenities:</h4>
                      <p className="mt-1 text-sm text-gray-500">{hotel.amenities}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link to={`/hotels/${hotel.hotelID}`}>
                      <Button variant="outline" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 