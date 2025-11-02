import React, { useState, useEffect } from 'react';
import './EventModal.css';
import { FiX, FiClock, FiMapPin, FiAlignLeft, FiTrash2, FiCalendar } from 'react-icons/fi';
import { eventsAPI } from '../../services/api';
import { format } from 'date-fns';

const EventModal = ({ event, initialDate, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    all_day: false,
    location: '',
    color: '#1a73e8',
    calendar_id: 'default',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const colorOptions = [
    { value: '#1a73e8', label: 'Blue' },
    { value: '#d50000', label: 'Red' },
    { value: '#e67c73', label: 'Tomato' },
    { value: '#f4511e', label: 'Tangerine' },
    { value: '#f6bf26', label: 'Banana' },
    { value: '#33b679', label: 'Sage' },
    { value: '#0b8043', label: 'Basil' },
    { value: '#039be5', label: 'Peacock' },
    { value: '#7986cb', label: 'Lavender' },
    { value: '#8e24aa', label: 'Grape' },
  ];

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_time: event.start_time ? format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm") : '',
        end_time: event.end_time ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm") : '',
        all_day: event.all_day || false,
        location: event.location || '',
        color: event.color || '#1a73e8',
        calendar_id: event.calendar_id || 'default',
      });
    } else if (initialDate) {
      // Creating new event with initial date
      const startTime = new Date(initialDate);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(10, 0, 0, 0);

      setFormData({
        ...formData,
        start_time: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [event, initialDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }

      if (!formData.start_time || !formData.end_time) {
        setError('Start and end times are required');
        setLoading(false);
        return;
      }

      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }

      const eventData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      if (event && event.original_id) {
        // Update existing event
        await eventsAPI.updateEvent(event.original_id || event.id, eventData);
      } else {
        // Create new event
        await eventsAPI.createEvent(eventData);
      }

      onSave();
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.error || 'Failed to save event');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await eventsAPI.deleteEvent(event.original_id || event.id);
      onDelete();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.error || 'Failed to delete event');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="event-modal">
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'New Event'}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Add title"
              className="title-input"
              autoFocus
            />
          </div>

          <div className="form-group with-icon">
            <FiClock className="form-icon" />
            <div className="time-inputs">
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="form-input"
              />
              <span className="time-separator">to</span>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="all_day"
                checked={formData.all_day}
                onChange={handleChange}
              />
              <span>All day</span>
            </label>
          </div>

          <div className="form-group with-icon">
            <FiMapPin className="form-icon" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Add location"
              className="form-input"
            />
          </div>

          <div className="form-group with-icon">
            <FiAlignLeft className="form-icon" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add description"
              className="form-input description-input"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <div className="footer-left">
              {event && (
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <FiTrash2 size={18} />
                  Delete
                </button>
              )}
            </div>
            <div className="footer-right">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EventModal;
