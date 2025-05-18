import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import hotelService from '../services/hotelService';
import roomService from '../services/roomService';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';

const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [showAddHotelForm, setShowAddHotelForm] = useState(false);
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    location: '',
    amenities: ''
  });
  const [roomForm, setRoomForm] = useState({
    type: '',
    price: '',
    features: '',
    availability: true
  });
  
  // Loading states
  const [submittingHotel, setSubmittingHotel] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          // Fetch hotels managed by this manager
          const hotelsResponse = await hotelService.getAllHotels();
          if (hotelsResponse.success) {
            // Filter hotels where managerID matches currentUser.id
            const managerHotels = hotelsResponse.data.filter(
              hotel => hotel.managerID === parseInt(currentUser.id)
            );
            setHotels(managerHotels);
            
            // If there are hotels, select the first one
            if (managerHotels.length > 0) {
              setSelectedHotel(managerHotels[0]);
              await fetchHotelDetails(managerHotels[0].hotelID);
            }
          } else {
            setError('Failed to fetch hotels. Please try again later.');
          }
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error fetching manager data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const fetchHotelDetails = async (hotelId) => {
    setLoading(true);
    try {
      // Fetch rooms for the hotel
      const roomsResponse = await roomService.getAllRooms();
      if (roomsResponse.success) {
        const hotelRooms = roomsResponse.data.filter(room => room.hotelID === hotelId);
        setRooms(hotelRooms);
      }
      
      // Fetch bookings for the hotel
      const bookingsResponse = await bookingService.getBookingsByHotel(hotelId);
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data);
      }
      
      // Fetch reviews for the hotel
      const reviewsResponse = await reviewService.getReviewsByHotel(hotelId);
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data);
      }
      
    } catch (err) {
      setError('Failed to fetch hotel details. Please try again.');
      console.error('Error fetching hotel details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    await fetchHotelDetails(hotel.hotelID);
  };
  
  const handleHotelFormChange = (e) => {
    const { name, value } = e.target;
    setHotelForm(prev => ({ ...prev, [name]: value }));
    setFormError('');
    setFormSuccess('');
  };
  
  const handleRoomFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setRoomForm(prev => ({ ...prev, [name]: newValue }));
    setFormError('');
    setFormSuccess('');
  };
  
  const handleSubmitHotel = async (e) => {
    e.preventDefault();
    
    if (!hotelForm.name || !hotelForm.location) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    setSubmittingHotel(true);
    setFormError('');
    
    try {
      const hotelData = {
        ...hotelForm,
        managerID: currentUser.id
      };
      
      const response = await hotelService.createHotel(hotelData);
      
      if (response.success) {
        setFormSuccess('Hotel added successfully!');
        setHotels(prev => [...prev, response.data]);
        setHotelForm({
          name: '',
          location: '',
          amenities: ''
        });
        setShowAddHotelForm(false);
      } else {
        setFormError(response.message || 'Failed to add hotel. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error adding hotel:', err);
    } finally {
      setSubmittingHotel(false);
    }
  };
  
  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    
    if (!roomForm.type || !roomForm.price) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    setSubmittingRoom(true);
    setFormError('');
    
    try {
      const response = await roomService.createRoom(selectedHotel.hotelID, roomForm);
      
      if (response.success) {
        setFormSuccess('Room added successfully!');
        setRooms(prev => [...prev, response.data]);
        setRoomForm({
          type: '',
          price: '',
          features: '',
          availability: true
        });
        setShowAddRoomForm(false);
      } else {
        setFormError(response.message || 'Failed to add room. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error adding room:', err);
    } finally {
      setSubmittingRoom(false);
    }
  };
  
  const handleToggleRoomAvailability = async (roomId, currentAvailability) => {
    try {
      const roomToUpdate = rooms.find(room => room.roomID === roomId);
      if (!roomToUpdate) return;
      
      const updatedRoom = { ...roomToUpdate, availability: !currentAvailability };
      
      const response = await roomService.updateRoom(roomId, updatedRoom);
      
      if (response.success) {
        // Update the rooms list with the updated room
        setRooms(prev => 
          prev.map(room => 
            room.roomID === roomId ? { ...room, availability: !currentAvailability } : room
          )
        );
      } else {
        setError('Failed to update room availability. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error updating room availability:', err);
    }
  };
  
  if (loading && hotels.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hotel Manager Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your hotels, rooms, bookings, and reviews.</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {formSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{formSuccess}</span>
          </div>
        )}
        
        {/* Hotel Selection */}
        <Card title="Your Hotels" className="mb-8">
          {hotels.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">You don't have any hotels yet.</p>
              <Button onClick={() => setShowAddHotelForm(true)}>Add New Hotel</Button>
            </div>
          ) : (
            <div>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {hotels.map((hotel) => (
                  <Card 
                    key={hotel.hotelID}
                    className={`cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                      selectedHotel?.hotelID === hotel.hotelID ? 'border-2 border-blue-500' : ''
                    }`}
                    onClick={() => handleSelectHotel(hotel)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">{hotel.location}</p>
                  </Card>
                ))}
              </div>
              <Button onClick={() => setShowAddHotelForm(true)}>Add New Hotel</Button>
            </div>
          )}
          
          {/* Add Hotel Form */}
          {showAddHotelForm && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Hotel</h3>
              
              <form onSubmit={handleSubmitHotel}>
                <FormInput
                  label="Hotel Name"
                  name="name"
                  value={hotelForm.name}
                  onChange={handleHotelFormChange}
                  required
                />
                
                <FormInput
                  label="Location"
                  name="location"
                  value={hotelForm.location}
                  onChange={handleHotelFormChange}
                  required
                />
                
                <FormInput
                  label="Amenities"
                  name="amenities"
                  value={hotelForm.amenities}
                  onChange={handleHotelFormChange}
                  placeholder="e.g. WiFi, Pool, Gym, Restaurant (comma separated)"
                />
                
                {formError && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{formError}</span>
                  </div>
                )}
                
                <div className="mt-6 flex space-x-4">
                  <Button
                    type="submit"
                    disabled={submittingHotel}
                  >
                    {submittingHotel ? <Spinner size="sm" /> : 'Add Hotel'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddHotelForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
        
        {selectedHotel && (
          <>
            {/* Hotel Details */}
            <Card title={`Managing: ${selectedHotel.name}`} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedHotel.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedHotel.amenities || 'None specified'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <Button variant="outline">Edit Hotel Details</Button>
                <Link to={`/hotels/${selectedHotel.hotelID}`} target="_blank">
                  <Button variant="outline">View Hotel Page</Button>
                </Link>
              </div>
            </Card>
            
            {/* Rooms Management */}
            <Card title="Manage Rooms" className="mb-8">
              {rooms.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No rooms added yet for this hotel.</p>
                  <Button onClick={() => setShowAddRoomForm(true)}>Add New Room</Button>
                </div>
              ) : (
                <div>
                  <div className="mb-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Features
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map((room) => (
                          <tr key={room.roomID}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {room.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${room.price}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {room.features || 'None'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {room.availability ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button 
                                variant={room.availability ? 'warning' : 'success'} 
                                className="mr-2"
                                onClick={() => handleToggleRoomAvailability(room.roomID, room.availability)}
                              >
                                {room.availability ? 'Set Unavailable' : 'Set Available'}
                              </Button>
                              <Button variant="outline">Edit</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button onClick={() => setShowAddRoomForm(true)}>Add New Room</Button>
                </div>
              )}
              
              {/* Add Room Form */}
              {showAddRoomForm && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Room</h3>
                  
                  <form onSubmit={handleSubmitRoom}>
                    <FormInput
                      label="Room Type"
                      name="type"
                      value={roomForm.type}
                      onChange={handleRoomFormChange}
                      required
                      placeholder="e.g. Standard, Deluxe, Suite"
                    />
                    
                    <FormInput
                      label="Price (per night)"
                      name="price"
                      type="number"
                      value={roomForm.price}
                      onChange={handleRoomFormChange}
                      required
                      min="0"
                      step="0.01"
                    />
                    
                    <FormInput
                      label="Features"
                      name="features"
                      value={roomForm.features}
                      onChange={handleRoomFormChange}
                      placeholder="e.g. King Bed, Sea View, Mini Bar (comma separated)"
                    />
                    
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          id="availability"
                          name="availability"
                          type="checkbox"
                          checked={roomForm.availability}
                          onChange={handleRoomFormChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="availability" className="ml-2 block text-sm text-gray-900">
                          Available for booking
                        </label>
                      </div>
                    </div>
                    
                    {formError && (
                      <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{formError}</span>
                      </div>
                    )}
                    
                    <div className="mt-6 flex space-x-4">
                      <Button
                        type="submit"
                        disabled={submittingRoom}
                      >
                        {submittingRoom ? <Spinner size="sm" /> : 'Add Room'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowAddRoomForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>
            
            {/* Bookings Management */}
            <Card title="Recent Bookings" className="mb-8">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Spinner size="lg" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No bookings found for this hotel.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.bookingID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.user?.name || 'Guest'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.room?.type || 'Room'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            
            {/* Reviews Management */}
            <Card title="Guest Reviews" className="mb-8">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Spinner size="lg" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No reviews yet for this hotel.</p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1">
                  {reviews.map((review) => (
                    <Card key={review.reviewID} className="mb-0">
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
                            <span className="ml-2 text-sm font-medium text-gray-600">
                              by {review.user?.name || 'Guest'}
                            </span>
                          </div>
                          <p className="text-gray-800">{review.comment}</p>
                        </div>
                        <div className="ml-4">
                          <Button variant="outline" size="sm">
                            Reply
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard; 
 