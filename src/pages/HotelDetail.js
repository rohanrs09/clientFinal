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
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-8 md:p-10">
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="mt-2 text-gray-600">{hotel.location}</p>
            
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
              <p className="mt-2 text-gray-600">{hotel.amenities}</p>
            </div>
          </div>
        </div>
        
        {/* Room Search Form */}
        <Card title="Find Available Rooms" className="mb-8">
          <form onSubmit={handleSearchRooms}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Check-in Date"
                type="date"
                name="checkInDate"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              
              <FormInput
                label="Check-out Date"
                type="date"
                name="checkOutDate"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
                min={checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                disabled={isSearching}
                fullWidth
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
        </Card>
        
        {/* Available Rooms */}
        {availableRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
            
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {availableRooms.map((room) => (
                <Card key={room.roomID} className="flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {room.type} Room
                    </h3>
                    <p className="mt-2 text-gray-600">Features: {room.features}</p>
                    <p className="mt-4 text-2xl font-bold text-blue-600">${room.price} / night</p>
                  </div>
                  
                  <div className="mt-6">
                    {bookingSuccess && selectedRoomId === room.roomID ? (
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">Booking successful! Check your bookings for details.</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleBookRoom(room.roomID)}
                        disabled={bookingInProgress && selectedRoomId === room.roomID}
                        fullWidth
                      >
                        {bookingInProgress && selectedRoomId === room.roomID ? (
                          <Spinner size="sm" />
                        ) : (
                          'Book Now'
                        )}
                      </Button>
                    )}
                    
                    {bookingError && selectedRoomId === room.roomID && (
                      <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{bookingError}</span>
                      </div>
                    )}
                  </div>
                </Card>
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
                <Card key={room.roomID} className="flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {room.type} Room
                    </h3>
                    <p className="mt-2 text-gray-600">Features: {room.features}</p>
                    <p className="mt-4 text-2xl font-bold text-blue-600">${room.price} / night</p>
                    <p className="mt-2 text-sm font-medium text-gray-500">
                      {room.availability ? 'Available' : 'Currently Unavailable'}
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      variant={room.availability ? 'primary' : 'secondary'}
                      disabled={!room.availability || !checkInDate || !checkOutDate}
                      onClick={() => {
                        if (checkInDate && checkOutDate) {
                          handleSearchRooms({ preventDefault: () => {} });
                        }
                      }}
                      fullWidth
                    >
                      {checkInDate && checkOutDate ? 'Check Availability' : 'Select Dates to Book'}
                    </Button>
                  </div>
                </Card>
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
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
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