import React from 'react';
import './MonthView.css';
import { getDaysInMonth, getEventsForDay } from '../../utils/dateUtils';
import { format, isSameMonth, isToday, isSameDay } from 'date-fns';

const MonthView = ({ currentDate, events, onEventClick, onDateClick }) => {
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const renderEvent = (event) => {
    const eventStart = new Date(event.start_time);
    const eventColor = event.color || '#1a73e8';

    return (
      <div
        key={event.id}
        className="month-event"
        style={{
          backgroundColor: eventColor,
          borderColor: eventColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
        title={event.title}
      >
        <span className="month-event-time">
          {!event.all_day && format(eventStart, 'h:mm a')}
        </span>
        <span className="month-event-title">{event.title}</span>
      </div>
    );
  };

  return (
    <div className="calendar-view month-view">
      <div className="month-grid">
        {/* Weekday headers */}
        <div className="month-header">
          {weekDays.map((day, index) => (
            <div key={index} className="month-header-cell">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="month-body">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(events, day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayCell = isToday(day);

            return (
              <div
                key={index}
                className={`month-cell ${!isCurrentMonth ? 'other-month' : ''} ${
                  isTodayCell ? 'today' : ''
                }`}
                onClick={() => onDateClick(day)}
              >
                <div className="month-cell-header">
                  <span className={`month-cell-date ${isTodayCell ? 'today-date' : ''}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="month-cell-events">
                  {dayEvents.slice(0, 3).map(event => renderEvent(event))}
                  {dayEvents.length > 3 && (
                    <div className="month-event-more">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
