import api from './api';

export const communityEventApi = {
  // Get all events
  getAllEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.featured) params.append('featured', filters.featured);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/community-events?${params.toString()}`);
    return response.data;
  },

  // Get event by ID
  getEventById: async (eventId) => {
    const response = await api.get(`/community-events/${eventId}`);
    return response.data;
  },

  // Create new event
  createEvent: async (eventData) => {
    const response = await api.post('/community-events', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/community-events/${eventId}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/community-events/${eventId}`);
    return response.data;
  },

  // Join event
  joinEvent: async (eventId) => {
    const response = await api.post(`/community-events/${eventId}/join`);
    return response.data;
  },

  // Leave event
  leaveEvent: async (eventId) => {
    const response = await api.delete(`/community-events/${eventId}/leave`);
    return response.data;
  },

  // Get user's joined events
  getUserEvents: async () => {
    const response = await api.get('/community-events/user/events');
    return response.data;
  },

  // Get tomorrow's events count
  getTomorrowEventsCount: async () => {
    const response = await api.get('/community-events/tomorrow/count');
    return response.data;
  },

  // Get tomorrow's events list
  getTomorrowEvents: async () => {
    const response = await api.get('/community-events/tomorrow/events');
    return response.data;
  }
}; 