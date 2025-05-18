import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

const GuestDashboard = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState('');
  
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          const response = await bookingService.getBookingsByUser(currentUser.id);
          if (response.success) {
            setBookings(response.data);
          } else {
            setError('Failed to fetch bookings. Please try again later.');
          }
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [currentUser]);
  
  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    setCancelError('');
    
    try {
      const response = await bookingService.deleteBooking(bookingId);
      if (response.success) {
        // Update the bookings list
        setBookings(prevBookings => prevBookings.filter(booking => booking.bookingID !== bookingId));
        
        // Show a temporary success message using browser alert
        alert('Booking cancelled successfully!');
      } else {
        setCancelError(response.message || 'Failed to cancel booking. Please try again.');
      }
    } catch (err) {
      setCancelError('An unexpected error occurred. Please try again.');
      console.error('Error cancelling booking:', err);
    } finally {
      setCancellingId(null);
    }
  };
  
  // Helper function to determine if a booking is in the past
  const isPastBooking = (checkOutDate) => {
    return new Date(checkOutDate) < new Date();
  };
  
  // Group bookings into upcoming and past
  const upcomingBookings = bookings.filter(booking => !isPastBooking(booking.checkOutDate));
  const pastBookings = bookings.filter(booking => isPastBooking(booking.checkOutDate));
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-3xl font-bold text-white">Welcome, {currentUser?.name || 'Guest'}!</h1>
            <p className="mt-2 text-blue-100">Manage your bookings and hotel experiences from your personal dashboard.</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-700">Total Bookings</h2>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-700">Upcoming Stays</h2>
                <p className="text-3xl font-bold text-gray-900">{upcomingBookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-700">Past Stays</h2>
                <p className="text-3xl font-bold text-gray-900">{pastBookings.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="text-lg font-medium text-gray-900">{currentUser?.name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-lg font-medium text-gray-900">{currentUser?.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                <p className="text-lg font-medium text-gray-900">{currentUser?.contactNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="text-lg font-medium text-gray-900 capitalize">{currentUser?.role || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link to="/profile">
                <Button variant="outline">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bookings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookings</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 text-gray-500 text-lg">You don't have any bookings yet.</p>
              <div className="mt-6">
                <Link to="/">
                  <Button>Browse Hotels</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.bookingID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white">
                          <p className="font-medium">{booking.room?.hotel?.name || 'Hotel'}</p>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {booking.room?.type || 'Room'} Room
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                ${booking.room?.price || '0'} per night
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-gray-600">Check-in:</span>
                              <span className="ml-1 text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-gray-600">Check-out:</span>
                              <span className="ml-1 text-gray-900">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            {cancellingId === booking.bookingID ? (
                              <Spinner size="sm" />
                            ) : (
                              <Button 
                                variant="danger" 
                                onClick={() => handleCancelBooking(booking.bookingID)}
                              >
                                Cancel Booking
                              </Button>
                            )}
                          </div>
                          
                          {cancelError && cancellingId === booking.bookingID && (
                            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                              <span className="block sm:inline">{cancelError}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Past Bookings</h3>
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {pastBookings.map((booking) => (
                      <div key={booking.bookingID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-2 text-white">
                          <p className="font-medium">{booking.room?.hotel?.name || 'Hotel'}</p>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {booking.room?.type || 'Room'} Room
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                ${booking.room?.price || '0'} per night
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-gray-600">Check-in:</span>
                              <span className="ml-1 text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-gray-600">Check-out:</span>
                              <span className="ml-1 text-gray-900">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Link to={`/hotels/${booking.room?.hotelID}`}>
                              <Button variant="outline">
                                Leave a Review
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/">
                <Button variant="primary" fullWidth>
                  Browse Hotels
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" fullWidth>
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard; 