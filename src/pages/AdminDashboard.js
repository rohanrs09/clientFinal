import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import hotelService from '../services/hotelService';
import roomService from '../services/roomService';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  
  // Data states
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI states
  const [activeTab, setActiveTab] = useState('users');
  const [showAssignManagerForm, setShowAssignManagerForm] = useState(false);
  const [assignManagerForm, setAssignManagerForm] = useState({
    hotelId: '',
    managerId: ''
  });
  
  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch all users
        const usersResponse = await userService.getAllUsers();
        if (usersResponse.success) {
          setUsers(usersResponse.data);
        } else {
          setError('Failed to fetch users. Please try again later.');
        }
        
        // Fetch all hotels
        const hotelsResponse = await hotelService.getAllHotels();
        if (hotelsResponse.success) {
          setHotels(hotelsResponse.data);
        } else {
          setError('Failed to fetch hotels. Please try again later.');
        }
        
        // Fetch all bookings
        const bookingsResponse = await bookingService.getAllBookings();
        if (bookingsResponse.success) {
          setBookings(bookingsResponse.data);
        } else {
          setError('Failed to fetch bookings. Please try again later.');
        }
        
        // Fetch all reviews
        const reviewsResponse = await reviewService.getAllReviews();
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data);
        } else {
          setError('Failed to fetch reviews. Please try again later.');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);
  
  const handleAssignManagerChange = (e) => {
    const { name, value } = e.target;
    setAssignManagerForm(prev => ({ ...prev, [name]: value }));
    setFormError('');
    setFormSuccess('');
  };
  
  const handleAssignManager = async (e) => {
    e.preventDefault();
    
    if (!assignManagerForm.hotelId || !assignManagerForm.managerId) {
      setFormError('Please select both a hotel and a manager.');
      return;
    }
    
    setSubmitting(true);
    setFormError('');
    
    try {
      const response = await userService.assignManagerToHotel(
        parseInt(assignManagerForm.hotelId),
        parseInt(assignManagerForm.managerId)
      );
      
      if (response.success) {
        setFormSuccess('Manager assigned to hotel successfully!');
        
        // Update the hotels list with the new manager
        setHotels(prev =>
          prev.map(hotel =>
            hotel.hotelID === parseInt(assignManagerForm.hotelId)
              ? { ...hotel, managerID: parseInt(assignManagerForm.managerId) }
              : hotel
          )
        );
        
        setAssignManagerForm({
          hotelId: '',
          managerId: ''
        });
        setShowAssignManagerForm(false);
      } else {
        setFormError(response.message || 'Failed to assign manager. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error assigning manager:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      
      if (response.success) {
        // Update the users list
        setUsers(prev => prev.filter(user => user.userID !== userId));
        setFormSuccess('User deleted successfully!');
      } else {
        setFormError(response.message || 'Failed to delete user. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error deleting user:', err);
    }
  };
  
  const handleDeleteHotel = async (hotelId) => {
    try {
      const response = await hotelService.deleteHotel(hotelId);
      
      if (response.success) {
        // Update the hotels list
        setHotels(prev => prev.filter(hotel => hotel.hotelID !== hotelId));
        setFormSuccess('Hotel deleted successfully!');
      } else {
        setFormError(response.message || 'Failed to delete hotel. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error deleting hotel:', err);
    }
  };
  
  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await reviewService.deleteReview(reviewId);
      
      if (response.success) {
        // Update the reviews list
        setReviews(prev => prev.filter(review => review.reviewID !== reviewId));
        setFormSuccess('Review deleted successfully!');
      } else {
        setFormError(response.message || 'Failed to delete review. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error deleting review:', err);
    }
  };
  
  // Helper functions
  const getManagerName = (managerId) => {
    const manager = users.find(user => user.userID === managerId);
    return manager ? manager.name : 'Not Assigned';
  };
  
  const getHotelName = (hotelId) => {
    const hotel = hotels.find(hotel => hotel.hotelID === hotelId);
    return hotel ? hotel.name : 'Unknown Hotel';
  };
  
  const getUserName = (userId) => {
    const user = users.find(user => user.userID === userId);
    return user ? user.name : 'Unknown User';
  };
  
  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage all aspects of the hotel booking system.</p>
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
        
        {formError && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`${
                activeTab === 'hotels'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Hotels
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Reviews
            </button>
          </nav>
        </div>
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card title="Users Management">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.userID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.userID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.contactNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="outline" 
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="danger"
                          onClick={() => handleDeleteUser(user.userID)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <Card title="Hotels Management">
            <div className="mb-4">
              <Button onClick={() => setShowAssignManagerForm(true)}>
                Assign Manager to Hotel
              </Button>
            </div>
            
            {showAssignManagerForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Manager to Hotel</h3>
                
                <form onSubmit={handleAssignManager}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Select Hotel
                    </label>
                    <select
                      name="hotelId"
                      value={assignManagerForm.hotelId}
                      onChange={handleAssignManagerChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="">-- Select Hotel --</option>
                      {hotels.map(hotel => (
                        <option key={hotel.hotelID} value={hotel.hotelID}>
                          {hotel.name} - {hotel.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Select Manager
                    </label>
                    <select
                      name="managerId"
                      value={assignManagerForm.managerId}
                      onChange={handleAssignManagerChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="">-- Select Manager --</option>
                      {users
                        .filter(user => user.role === 'manager')
                        .map(manager => (
                          <option key={manager.userID} value={manager.userID}>
                            {manager.name} - {manager.email}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? <Spinner size="sm" /> : 'Assign Manager'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAssignManagerForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amenities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hotels.map((hotel) => (
                    <tr key={hotel.hotelID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hotel.hotelID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {hotel.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hotel.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getManagerName(hotel.managerID)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {hotel.amenities || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="outline" 
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="danger"
                          onClick={() => handleDeleteHotel(hotel.hotelID)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card title="Bookings Management">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hotel
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.bookingID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.bookingID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getUserName(booking.userID)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.room?.hotel?.name || 'Unknown Hotel'}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <Card title="Reviews Management">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hotel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.reviewID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {review.reviewID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getUserName(review.userID)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getHotelName(review.hotelID)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {review.comment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="danger"
                          onClick={() => handleDeleteReview(review.reviewID)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-blue-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm font-medium text-blue-500">Total Users</div>
            </div>
          </Card>
          <Card className="bg-green-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{hotels.length}</div>
              <div className="text-sm font-medium text-green-500">Total Hotels</div>
            </div>
          </Card>
          <Card className="bg-yellow-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{bookings.length}</div>
              <div className="text-sm font-medium text-yellow-500">Total Bookings</div>
            </div>
          </Card>
          <Card className="bg-purple-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reviews.length}</div>
              <div className="text-sm font-medium text-purple-500">Total Reviews</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 