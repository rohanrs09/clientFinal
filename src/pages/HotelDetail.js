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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error && !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hotel Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white px-6 py-8 text-center">{hotel.name}</h1>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap items-center mb-4 gap-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-700 font-medium">{hotel.location}</p>
              </div>
              
              <div className="ml-auto">
                {renderStarRating(hotel.rating)}
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Amenities</h2>
              {renderAmenities(hotel.amenities) || <p className="text-sm text-gray-500">No amenities listed</p>}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-blue-50 rounded-lg p-4 flex-1">
                <div className="text-blue-800 font-semibold">Rooms Available</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{hotel.rooms?.length || 0}</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 flex-1">
                <div className="text-purple-800 font-semibold">Guest Reviews</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">{hotel.reviews?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Room Search Form */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Find Available Rooms</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSearchRooms}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="checkInDate">
                    Check-in Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="checkInDate"
                      type="date"
                      name="checkInDate"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="shadow-sm appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="checkOutDate">
                    Check-out Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="checkOutDate"
                      type="date"
                      name="checkOutDate"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      className="shadow-sm appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="px-8 py-3"
                >
                  {isSearching ? <Spinner size="sm" /> : 'Search Available Rooms'}
                </Button>
              </div>
            </form>
            
            {error && !loading && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Available Rooms */}
        {availableRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
            
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {availableRooms.map((room) => (
                <div key={room.roomID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {room.type} Room
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Available
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="font-medium">Features:</span> 
                        <span className="ml-2">{room.features || 'Standard amenities'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">${room.price}</p>
                        <p className="text-gray-500 text-sm">per night</p>
                      </div>
                      
                      <div>
                        {bookingSuccess && selectedRoomId === room.roomID ? (
                          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">Booking successful!</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleBookRoom(room.roomID)}
                            disabled={bookingInProgress && selectedRoomId === room.roomID}
                            className="px-6"
                          >
                            {bookingInProgress && selectedRoomId === room.roomID ? (
                              <Spinner size="sm" />
                            ) : (
                              'Book Now'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {bookingError && selectedRoomId === room.roomID && (
                      <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{bookingError}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Rooms */}
        {rooms.length > 0 && availableRooms.length === 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Rooms</h2>
            
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {rooms.map((room) => (
                <div key={room.roomID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {room.type} Room
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {room.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="font-medium">Features:</span> 
                        <span className="ml-2">{room.features || 'Standard amenities'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">${room.price}</p>
                        <p className="text-gray-500 text-sm">per night</p>
                      </div>
                      
                      <Button
                        variant={room.availability ? 'primary' : 'secondary'}
                        disabled={!room.availability || !checkInDate || !checkOutDate}
                        onClick={() => {
                          if (checkInDate && checkOutDate) {
                            handleSearchRooms({ preventDefault: () => {} });
                          }
                        }}
                        className="px-6"
                      >
                        {checkInDate && checkOutDate ? 'Check Availability' : 'Select Dates to Book'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Reviews</h2>
          
          {/* Review Form */}
          {isAuthenticated() && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h3>
              
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                
                <FormInput
                  label="Comment"
                  type="textarea"
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  placeholder="Share your experience at this hotel..."
                  required
                />
                
                <div className="mt-6">
                  <Button
                    type="submit"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? <Spinner size="sm" /> : 'Submit Review'}
                  </Button>
                </div>
                
                {reviewSuccess && (
                  <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">Your review has been submitted successfully!</span>
                  </div>
                )}
                
                {reviewError && (
                  <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{reviewError}</span>
                  </div>
                )}
              </form>
            </Card>
          )}
          
          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="grid gap-6 grid-cols-1">
              {reviews.map((review) => (
                <Card key={review.reviewID}>
                  <div className="flex items-start">
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {renderStarRating(review.rating)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{review.comment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to leave a review!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetail; 