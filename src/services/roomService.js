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
    // Check if id is a valid number
    if (!id || isNaN(parseInt(id))) {
      return { success: false, message: 'Invalid room ID' };
    }

    // Convert id to integer to ensure proper formatting
    const roomId = parseInt(id);
    const response = await api.get(`/Rooms/${roomId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching room:', error);
    return { 
      success: false, 
      message: error.response?.status === 400 
        ? 'Invalid room ID or room not found' 
        : error.response?.data || 'Failed to fetch room' 
    };
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
    // Ensure roomID is a valid integer
    const roomId = parseInt(id);
    if (isNaN(roomId)) {
      return { success: false, message: 'Invalid room ID' };
    }
    
    // Price validation - API expects a decimal between 1000 and 1000000000
    const price = parseFloat(roomData.price);
    if (isNaN(price) || price < 1000 || price > 1000000000) {
      return { success: false, message: 'Price must be between 1000 and 1000000000' };
    }
    
    // Ensure all required fields are present and properly formatted
    const formattedRoomData = {
      roomID: roomId,
      hotelID: parseInt(roomData.hotelID),
      type: roomData.type || "Standard", // Ensure type is not empty
      price: price,
      availability: Boolean(roomData.availability), // Ensure it's a boolean
      features: roomData.features || ""  // Ensure features is not null
    };
    
    // Ensure hotelID is a valid integer
    if (isNaN(formattedRoomData.hotelID)) {
      return { success: false, message: 'Invalid hotel ID' };
    }
    
    console.log('Sending room update:', formattedRoomData);
    const response = await api.put(`/Rooms/${roomId}`, formattedRoomData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating room:', error);
    return { 
      success: false, 
      message: error.response?.data || 'Failed to update room' 
    };
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
    // Validate dates
    if (!checkInDate || !checkOutDate) {
      return { success: false, message: 'Check-in and check-out dates are required' };
    }
    
    // Convert to Date objects if they're not already
    const checkIn = checkInDate instanceof Date ? checkInDate : new Date(checkInDate);
    const checkOut = checkOutDate instanceof Date ? checkOutDate : new Date(checkOutDate);
    
    // Validate converted dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return { success: false, message: 'Invalid date format' };
    }
    
    const response = await api.get(`/Rooms/AvailableRooms/${hotelId}`, {
      params: { 
        checkInDate: checkIn.toISOString(), 
        checkOutDate: checkOut.toISOString()
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching available rooms:', error);
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