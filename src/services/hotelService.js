import api from './api';

const getAllHotels = async () => {
  try {
    const response = await api.get('/Hotels');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch hotels' };
  }
};

const getHotelById = async (id) => {
  try {
    const response = await api.get(`/Hotels/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch hotel' };
  }
};

const getHotelByName = async (name) => {
  try {
    const response = await api.get(`/Hotels/ByName/${name}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch hotel' };
  }
};

const createHotel = async (hotelData) => {
  try {
    const response = await api.post('/Hotels', hotelData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to create hotel' };
  }
};

const updateHotel = async (id, hotelData) => {
  try {
    const response = await api.put(`/Hotels/${id}`, hotelData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to update hotel' };
  }
};

const deleteHotel = async (id) => {
  try {
    await api.delete(`/Hotels/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to delete hotel' };
  }
};

const searchHotels = async (location, amenities) => {
  try {
    const response = await api.get('/Hotels/Search', {
      params: { location, amenities }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to search hotels' };
  }
};

const getHotelsWithAvailableRooms = async () => {
  try {
    const response = await api.get('/Hotels/AvailableHotels');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch hotels with available rooms' };
  }
};

const hotelService = {
  getAllHotels,
  getHotelById,
  getHotelByName,
  createHotel,
  updateHotel,
  deleteHotel,
  searchHotels,
  getHotelsWithAvailableRooms
};

export default hotelService; 