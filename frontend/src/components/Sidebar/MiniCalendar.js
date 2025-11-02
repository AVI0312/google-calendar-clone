import React, { useState } from 'react';
import './MiniCalendar.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths
} from 'date-fns';

const MiniCalendar = ({ currentDate, onDateSelect }) => {
  const [displayMonth, setDisplayMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="mini-calendar-header">
        <button 
          className="mini-nav-button"
          onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
          aria-label="Previous month"
        >
          <FiChevronLeft size={16} />
        </button>
        <span className="mini-month-year">
          {format(displayMonth, 'MMMM yyyy')}
        </span>
        <button 
          className="mini-nav-button"
          onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
          aria-label="Next month"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <div className="mini-calendar-days">
        {days.map((day, index) => (
          <div key={index} className="mini-day-name">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        days.push(
          <div
            key={day}
            className={`mini-calendar-cell ${
              !isSameMonth(day, monthStart) ? 'disabled' : ''
            } ${isSameDay(day, currentDate) ? 'selected' : ''} ${
              isToday(day) ? 'today' : ''
            }`}
            onClick={() => {
              if (isSameMonth(cloneDay, monthStart)) {
                onDateSelect(cloneDay);
              }
            }}
          >
            <span>{format(day, 'd')}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="mini-calendar-row">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="mini-calendar-body">{rows}</div>;
  };

  return (
    <div className="mini-calendar">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default MiniCalendar;
