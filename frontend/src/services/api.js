import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Events API
export const eventsAPI = {
  getEvents: (start, end, calendarId) => {
    const params = { start, end };
    if (calendarId) params.calendarId = calendarId;
    return api.get('/events', { params });
  },
  
  getEventById: (id) => api.get(`/events/${id}`),
  
  createEvent: (eventData) => api.post('/events', eventData),
  
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  deleteEvent: (id, deleteType = 'single') => 
    api.delete(`/events/${id}`, { params: { deleteType } }),
  
  checkConflicts: (eventData) => api.post('/events/check-conflicts', eventData),
  
  getRecurringInstances: (id, start, end) => 
    api.get(`/events/${id}/instances`, { params: { start, end } }),
};

// Calendars API
export const calendarsAPI = {
  getCalendars: () => api.get('/calendars'),
  
  getCalendarById: (id) => api.get(`/calendars/${id}`),
  
  createCalendar: (calendarData) => api.post('/calendars', calendarData),
  
  updateCalendar: (id, calendarData) => api.put(`/calendars/${id}`, calendarData),
  
  deleteCalendar: (id) => api.delete(`/calendars/${id}`),
};

export default api;
