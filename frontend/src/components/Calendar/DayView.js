import React from 'react';
import './DayView.css';
import { getTimeSlots, getEventsForDay, calculateEventPosition } from '../../utils/dateUtils';
import { format, isToday } from 'date-fns';

const DayView = ({ currentDate, events, onEventClick, onDateClick }) => {
  const timeSlots = getTimeSlots();
  const dayEvents = getEventsForDay(events, currentDate);

  const renderEvent = (event) => {
    const { top, height } = calculateEventPosition(event, currentDate);
    const eventColor = event.color || '#1a73e8';

    return (
      <div
        key={event.id}
        className="day-event"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: eventColor,
          borderColor: eventColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
      >
        <div className="day-event-content">
          <div className="day-event-time">
            {!event.all_day && format(new Date(event.start_time), 'h:mm a')}
          </div>
          <div className="day-event-title">{event.title}</div>
          {event.location && (
            <div className="day-event-location">{event.location}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-view day-view">
      <div className="day-grid">
        {/* Header */}
        <div className="day-header">
          <div className="day-time-column-header"></div>
          <div className={`day-header-cell ${isToday(currentDate) ? 'today' : ''}`}>
            <div className="day-name">{format(currentDate, 'EEEE')}</div>
            <div className={`day-number ${isToday(currentDate) ? 'today-number' : ''}`}>
              {format(currentDate, 'd')}
            </div>
          </div>
        </div>

        {/* Time slots and events */}
        <div className="day-body">
          <div className="day-time-column">
            {timeSlots.map((slot, index) => (
              <div key={index} className="day-time-slot">
                {slot.displayLabel && (
                  <span className="day-time-label">{slot.displayLabel}</span>
                )}
              </div>
            ))}
          </div>

          <div className="day-content-column">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="day-content-slot"
                onClick={() => onDateClick(currentDate)}
              />
            ))}
            <div className="day-events-container">
              {dayEvents.map(event => renderEvent(event))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
