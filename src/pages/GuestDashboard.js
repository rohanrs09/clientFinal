import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';

const GuestDashboard = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
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
    setCancelSuccess(false);
    setCancelError('');
    
    try {
      const response = await bookingService.deleteBooking(bookingId);
      if (response.success) {
        setCancelSuccess(true);
        // Remove the cancelled booking from the list
        setBookings(prevBookings => prevBookings.filter(booking => booking.bookingID !== bookingId));
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {currentUser?.name || 'Guest'}!</h1>
          <p className="mt-2 text-gray-600">Manage your bookings and reviews from your dashboard.</p>
        </div>
        
        {/* User Profile Summary */}
        <Card title="Your Profile" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">{currentUser?.name || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">{currentUser?.email || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">{currentUser?.contactNumber || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">{currentUser?.role || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link to="/profile">
              <Button variant="outline">
                Edit Profile
              </Button>
            </Link>
          </div>
        </Card>
        
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
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">You don't have any bookings yet.</p>
                <div className="mt-6">
                  <Link to="/">
                    <Button>Browse Hotels</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {upcomingBookings.map((booking) => (
                      <Card key={booking.bookingID}>
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {booking.room?.hotel?.name || 'Hotel'} - {booking.room?.type || 'Room'}
                            </h4>
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-semibold">Check-in:</span> {new Date(booking.checkInDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Check-out:</span> {new Date(booking.checkOutDate).toLocaleDateString()}
                            </p>
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-semibold">Status:</span> {booking.status}
                            </p>
                          </div>
                          <div>
                            {cancellingId === booking.bookingID ? (
                              <Spinner size="sm" />
                            ) : (
                              <Button 
                                variant="danger" 
                                onClick={() => handleCancelBooking(booking.bookingID)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {cancelError && cancellingId === booking.bookingID && (
                          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{cancelError}</span>
                          </div>
                        )}
                      </Card>
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
                      <Card key={booking.bookingID}>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {booking.room?.hotel?.name || 'Hotel'} - {booking.room?.type || 'Room'}
                          </h4>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Check-in:</span> {new Date(booking.checkInDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Check-out:</span> {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Status:</span> {booking.status}
                          </p>
                        </div>
                        
                        <div className="mt-4">
                          <Link to={`/hotels/${booking.room?.hotelID}`}>
                            <Button variant="outline" size="sm">
                              Leave a Review
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <Card title="Quick Actions" className="mb-8">
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
        </Card>
      </div>
    </div>
  );
};

export default GuestDashboard; 