import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import FormInput from '../components/FormInput';
import hotelService from '../services/hotelService';
import roomService from '../services/roomService';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and booking state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  useEffect(() => {
    const fetchHotelDetails = async () => {
      setLoading(true);
      try {
        // Fetch hotel details
        const hotelResponse = await hotelService.getHotelById(id);
        if (hotelResponse.success) {
          setHotel(hotelResponse.data);
        } else {
          setError('Failed to fetch hotel details.');
          return;
        }
        
        // Fetch all rooms for the hotel
        const roomsResponse = await roomService.getAllRooms();
        if (roomsResponse.success) {
          const hotelRooms = roomsResponse.data.filter(room => room.hotelID === parseInt(id));
          setRooms(hotelRooms);
        } else {
          setError('Failed to fetch rooms.');
        }
        
        // Fetch reviews for the hotel
        const reviewsResponse = await reviewService.getReviewsByHotel(id);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data);
        }
        
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error fetching hotel details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotelDetails();
  }, [id]);
  
  const handleSearchRooms = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates.');
      setIsSearching(false);
      return;
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn >= checkOut) {
      setError('Check-out date must be after check-in date.');
      setIsSearching(false);
      return;
    }
    
    try {
      const response = await roomService.getAvailableRooms(id, checkIn, checkOut);
      if (response.success) {
        setAvailableRooms(response.data);
      } else {
        setError('Failed to fetch available rooms. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error searching rooms:', err);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleBookRoom = async (roomId) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/hotels/${id}` } });
      return;
    }
    
    setSelectedRoomId(roomId);
    setBookingInProgress(true);
    setBookingError('');
    
    try {
      const bookingData = {
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString()
      };
      
      const response = await bookingService.createBooking(roomId, bookingData);
      if (response.success) {
        setBookingSuccess(true);
        
        // Remove the booked room from available rooms
        setAvailableRooms(prevRooms => prevRooms.filter(room => room.roomID !== roomId));
      } else {
        setBookingError(response.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setBookingError('An unexpected error occurred. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setBookingInProgress(false);
    }
  };
  
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (reviewError) setReviewError('');
    if (reviewSuccess) setReviewSuccess(false);
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/hotels/${id}` } });
      return;
    }
    
    if (!reviewForm.comment.trim()) {
      setReviewError('Please provide a comment for your review.');
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError('');
    
    try {
      const reviewData = {
        hotelID: parseInt(id),
        userID: currentUser.id,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      };
      
      const response = await reviewService.createReview(reviewData);
      if (response.success) {
        setReviewSuccess(true);
        setReviewForm({ rating: 5, comment: '' });
        
        // Add the new review to the reviews list
        setReviews(prev => [response.data, ...prev]);
      } else {
        setReviewError(response.message || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      setReviewError('An unexpected error occurred. Please try again.');
      console.error('Review error:', err);
    } finally {
      setIsSubmittingReview(false);
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
    <div className="bg-gray-50 min-h-screen pb-12">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : error && !hotel ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Hotel Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-800 py-16 relative overflow-hidden">
            {/* Background pattern */}
            <div className="hidden sm:block sm:absolute sm:inset-0 opacity-10">
              <svg className="absolute right-0 top-0" width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
                <defs>
                  <pattern id="pattern-squares" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-white" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="404" fill="url(#pattern-squares)" />
              </svg>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {hotel.name}
                </h1>
                <div className="flex items-center justify-center mt-4 text-white">
                  <svg className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-xl font-medium">{hotel.location}</p>
                </div>
                {hotel.amenities && (
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {hotel.amenities.split(',').map((amenity, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm font-medium rounded-full"
                      >
                        {amenity.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Room Search Form */}
            <div className="bg-white rounded-lg shadow-lg -mt-10 p-6 mb-12 relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Available Rooms</h2>
              
              <form onSubmit={handleSearchRooms} className="grid gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    id="checkInDate"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    id="checkOutDate"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="gradient-blue"
                    loading={isSearching}
                    fullWidth
                  >
                    Check Availability
                  </Button>
                </div>
              </form>
              
              {error && !loading && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
            </div>
            
            {/* Available Rooms Section */}
            {availableRooms.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Available Rooms</h2>
                  <div className="flex items-center text-green-600">
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{availableRooms.length} rooms available for your dates</span>
                  </div>
                </div>
                
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  {availableRooms.map((room) => (
                    <div key={room.roomID} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {room.type} Room
                          </h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                            Available
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="space-y-4">
                              <div className="flex items-start text-gray-600">
                                <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <div>
                                  <span className="font-medium text-gray-900">Features:</span>
                                  <p className="mt-1">{room.features || 'Standard amenities'}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start text-gray-600">
                                <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                  <span className="font-medium text-gray-900">Stay Duration:</span>
                                  <p className="mt-1">
                                    {checkInDate && checkOutDate ? (
                                      `${new Date(checkInDate).toLocaleDateString()} - ${new Date(checkOutDate).toLocaleDateString()}`
                                    ) : (
                                      'Select dates above'
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-between">
                            <div className="text-right">
                              <div className="text-3xl font-bold text-blue-600">${room.price}</div>
                              <p className="text-gray-500 text-sm">per night</p>
                            </div>
                            
                            <div className="mt-6">
                              {bookingSuccess && selectedRoomId === room.roomID ? (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">
                                  <div className="flex">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Booking successful!</span>
                                  </div>
                                  <p className="mt-2 text-sm">Check your dashboard for booking details.</p>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => handleBookRoom(room.roomID)}
                                  variant="gradient-blue"
                                  size="lg"
                                  loading={bookingInProgress && selectedRoomId === room.roomID}
                                  fullWidth
                                >
                                  Book Now
                                </Button>
                              )}
                              
                              {bookingError && selectedRoomId === room.roomID && (
                                <div className="mt-3 text-red-600 text-sm">
                                  {bookingError}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Rooms Section */}
            {!availableRooms.length && rooms.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Rooms</h2>
                
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  {rooms.map((room) => (
                    <div key={room.roomID} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {room.type} Room
                          </h3>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {room.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="space-y-4">
                              <div className="flex items-start text-gray-600">
                                <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <div>
                                  <span className="font-medium text-gray-900">Features:</span>
                                  <p className="mt-1">{room.features || 'Standard amenities'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-between">
                            <div className="text-right">
                              <div className="text-3xl font-bold text-blue-600">${room.price}</div>
                              <p className="text-gray-500 text-sm">per night</p>
                            </div>
                            
                            <div className="mt-6">
                              <Button
                                variant={room.availability ? 'primary' : 'secondary'}
                                disabled={!room.availability || !checkInDate || !checkOutDate}
                                size="lg"
                                fullWidth
                                onClick={() => {
                                  if (room.availability && (!checkInDate || !checkOutDate)) {
                                    // Scroll to the date selection form
                                    window.scrollTo({
                                      top: 0,
                                      behavior: 'smooth'
                                    });
                                  } else if (room.availability && checkInDate && checkOutDate) {
                                    handleSearchRooms({ preventDefault: () => {} });
                                  }
                                }}
                              >
                                {!room.availability ? 'Not Available' : 
                                 !checkInDate || !checkOutDate ? 'Select Dates Above' : 
                                 'Check Availability'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reviews Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Guest Reviews</h2>
              
              {reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <svg className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-500">Be the first to review this hotel!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div key={review.reviewID} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <span className="text-blue-700 font-bold">
                              {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'G'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{review.user?.name || 'Guest'}</h4>
                            <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Review Form */}
              {isAuthenticated() && (
                <div className="mt-12 bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>
                  
                  {reviewSuccess ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                      <div className="flex">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Thank you for your review!</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <svg
                                className={`h-8 w-8 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer hover:text-yellow-400 transition-colors duration-150`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                        <textarea
                          id="comment"
                          name="comment"
                          rows="4"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Share your experience staying at this hotel..."
                          required
                        ></textarea>
                      </div>
                      
                      {reviewError && (
                        <div className="text-red-600 text-sm">
                          {reviewError}
                        </div>
                      )}
                      
                      <div>
                        <Button
                          type="submit"
                          variant="primary"
                          loading={isSubmittingReview}
                        >
                          Submit Review
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HotelDetail; 