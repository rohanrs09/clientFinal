import api from './api';

const getAllReviews = async () => {
  try {
    const response = await api.get('/Review');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch reviews' };
  }
};

const getReviewsByHotel = async (hotelId) => {
  try {
    const response = await api.get(`/Review/Hotel/${hotelId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch hotel reviews' };
  }
};

const getReviewById = async (id) => {
  try {
    const response = await api.get(`/Review/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to fetch review' };
  }
};

const createReview = async (reviewData) => {
  try {
    const response = await api.post('/Review', reviewData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to create review' };
  }
};

const updateReview = async (id, reviewData) => {
  try {
    const response = await api.put(`/Review/${id}`, reviewData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to update review' };
  }
};

const deleteReview = async (id) => {
  try {
    await api.delete(`/Review/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data || 'Failed to delete review' };
  }
};

const reviewService = {
  getAllReviews,
  getReviewsByHotel,
  getReviewById,
  createReview,
  updateReview,
  deleteReview
};

export default reviewService; 