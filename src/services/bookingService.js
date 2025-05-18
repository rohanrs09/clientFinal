import api from './api';

const getAllBookings = async () => {
  try {
    const response = await api.get('/Bookings');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch bookings' };
  }
};

const getBookingsByHotel = async (hotelId) => {
  try {
    const response = await api.get(`/Bookings/Hotel/${hotelId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch bookings for hotel' };
  }
};

const getBookingsByUser = async (userId) => {
  try {
    const response = await api.get(`/Bookings/User/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch user bookings' };
  }
};

const getBookingById = async (id) => {
  try {
    const response = await api.get(`/Bookings/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch booking' };
  }
};

const createBooking = async (roomId, bookingData) => {
  try {
    const response = await api.post(`/Bookings/${roomId}`, bookingData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || error.response?.data || 'Failed to create booking' 
    };
  }
};

const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/Bookings/${id}`, bookingData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || error.response?.data || 'Failed to update booking' 
    };
  }
};

const deleteBooking = async (id) => {
  try {
    await api.delete(`/Bookings/${id}`);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || error.response?.data || 'Failed to cancel booking' 
    };
  }
};

const bookingService = {
  getAllBookings,
  getBookingsByHotel,
  getBookingsByUser,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};

export default bookingService; 