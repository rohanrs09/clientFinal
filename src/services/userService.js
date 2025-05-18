import api from './api';

const getAllUsers = async () => {
  try {
    const response = await api.get('/User');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch users' };
  }
};

const getUserById = async (id) => {
  try {
    const response = await api.get(`/User/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch user' };
  }
};

const getUsersByHotel = async (hotelName) => {
  try {
    const response = await api.get(`/User/by-hotel-name/${hotelName}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch users for hotel' };
  }
};

const createUser = async (userData) => {
  try {
    const response = await api.post('/User', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to create user' };
  }
};

const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/User/${id}`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to update user' };
  }
};

const deleteUser = async (id) => {
  try {
    await api.delete(`/User/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to delete user' };
  }
};

const assignManagerToHotel = async (hotelId, managerId) => {
  try {
    const response = await api.post('/User/assign-manager', { hotelId, managerId });
    return { success: true, message: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to assign manager to hotel' };
  }
};

const userService = {
  getAllUsers,
  getUserById,
  getUsersByHotel,
  createUser,
  updateUser,
  deleteUser,
  assignManagerToHotel
};

export default userService; 