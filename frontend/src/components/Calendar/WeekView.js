import React from 'react';
import './WeekView.css';
import { getDaysInWeek, getTimeSlots, getEventsForDay, calculateEventPosition } from '../../utils/dateUtils';
import { format, isToday } from 'date-fns';

const WeekView = ({ currentDate, events, onEventClick, onDateClick }) => {
  const days = getDaysInWeek(currentDate);
  const timeSlots = getTimeSlots();

  const renderEvent = (event, day) => {
    const { top, height } = calculateEventPosition(event, day);
    const eventColor = event.color || '#1a73e8';

    return (
      <div
        key={event.id}
        className="week-event"
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
        <div className="week-event-content">
          <div className="week-event-title">{event.title}</div>
          {!event.all_day && (
            <div className="week-event-time">
              {format(new Date(event.start_time), 'h:mm a')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-view week-view">
      <div className="week-grid">
        {/* Header with day names */}
        <div className="week-header">
          <div className="week-time-column-header"></div>
          {days.map((day, index) => (
            <div
              key={index}
              className={`week-header-cell ${isToday(day) ? 'today' : ''}`}
            >
              <div className="week-day-name">{format(day, 'EEE')}</div>
              <div className={`week-day-number ${isToday(day) ? 'today-number' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots and events */}
        <div className="week-body">
          <div className="week-time-column">
            {timeSlots.map((slot, index) => (
              <div key={index} className="week-time-slot">
                {slot.displayLabel && (
                  <span className="week-time-label">{slot.displayLabel}</span>
                )}
              </div>
            ))}
          </div>

          <div className="week-days-container">
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day);

              return (
                <div key={dayIndex} className="week-day-column">
                  {timeSlots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className="week-day-slot"
                      onClick={() => onDateClick(day)}
                    />
                  ))}
                  <div className="week-events-container">
                    {dayEvents.map(event => renderEvent(event, day))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
