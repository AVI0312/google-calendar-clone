import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MonthView from './components/Calendar/MonthView';
import WeekView from './components/Calendar/WeekView';
import DayView from './components/Calendar/DayView';
import EventModal from './components/EventModal/EventModal';
import { eventsAPI } from './services/api';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from 'date-fns';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let start, end;

      if (view === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        start = startOfWeek(monthStart, { weekStartsOn: 0 });
        end = endOfWeek(monthEnd, { weekStartsOn: 0 });
      } else if (view === 'week') {
        start = startOfWeek(currentDate, { weekStartsOn: 0 });
        end = addDays(start, 6);
      } else {
        start = currentDate;
        end = currentDate;
      }

      const response = await eventsAPI.getEvents(
        format(start, "yyyy-MM-dd'T'HH:mm:ss"),
        format(addDays(end, 1), "yyyy-MM-dd'T'HH:mm:ss")
      );

      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleCreateEvent = (date = null) => {
    setSelectedEvent(null);
    setModalDate(date || currentDate);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setModalDate(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setModalDate(null);
  };

  const handleSaveEvent = async () => {
    await fetchEvents();
    handleCloseModal();
  };

  const handleDeleteEvent = async () => {
    await fetchEvents();
    handleCloseModal();
  };

  const renderCalendarView = () => {
    const commonProps = {
      currentDate,
      events,
      onEventClick: handleEditEvent,
      onDateClick: handleCreateEvent,
    };

    switch (view) {
      case 'week':
        return <WeekView {...commonProps} />;
      case 'day':
        return <DayView {...commonProps} />;
      case 'month':
      default:
        return <MonthView {...commonProps} />;
    }
  };

  return (
    <div className="App">
      <Header
        currentDate={currentDate}
        view={view}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
      />
      
      <div className="app-container">
        <Sidebar
          currentDate={currentDate}
          onDateSelect={handleDateChange}
          onCreateEvent={handleCreateEvent}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <div>Loading events...</div>
          </div>
        ) : error ? (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        ) : (
          renderCalendarView()
        )}
      </div>

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          initialDate={modalDate}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

export default App;
