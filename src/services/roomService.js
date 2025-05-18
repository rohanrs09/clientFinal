import api from './api';

const getAllRooms = async () => {
  try {
    const response = await api.get('/Rooms');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch rooms' };
  }
};

const getRoomById = async (id) => {
  try {
    const response = await api.get(`/Rooms/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch room' };
  }
};

const createRoom = async (hotelId, roomData) => {
  try {
    const response = await api.post(`/Rooms/${hotelId}`, roomData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to create room' };
  }
};

const updateRoom = async (id, roomData) => {
  try {
    const response = await api.put(`/Rooms/${id}`, roomData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to update room' };
  }
};

const deleteRoom = async (id) => {
  try {
    await api.delete(`/Rooms/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to delete room' };
  }
};

const searchRooms = async (type, minPrice, maxPrice, availability) => {
  try {
    const response = await api.get('/Rooms/Search', {
      params: { type, minPrice, maxPrice, availability }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to search rooms' };
  }
};

const getAvailableRooms = async (hotelId, checkInDate, checkOutDate) => {
  try {
    const response = await api.get(`/Rooms/AvailableRooms/${hotelId}`, {
      params: { 
        checkInDate: checkInDate.toISOString(), 
        checkOutDate: checkOutDate.toISOString()
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch available rooms' };
  }
};

const roomService = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  searchRooms,
  getAvailableRooms
};

export default roomService; 