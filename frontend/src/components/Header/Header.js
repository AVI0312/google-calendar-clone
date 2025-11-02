import React, { useState } from 'react';
import './Header.css';
import { FiMenu, FiChevronLeft, FiChevronRight, FiChevronDown, FiCheck } from 'react-icons/fi';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

const Header = ({ currentDate, view, onDateChange, onViewChange }) => {
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  const handlePrevious = () => {
    if (view === 'month') {
      onDateChange(subMonths(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      onDateChange(addMonths(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateDisplay = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      return format(currentDate, 'MMMM d, yyyy');
    }
  };

  const viewOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="#1a73e8"/>
            </svg>
          </div>
          <span className="logo-text">Calendar</span>
        </div>
      </div>

      <div className="header-center">
        <button className="today-button" onClick={handleToday}>
          Today
        </button>
        
        <div className="nav-controls">
          <button className="icon-button" onClick={handlePrevious} aria-label="Previous">
            <FiChevronLeft size={20} />
          </button>
          <button className="icon-button" onClick={handleNext} aria-label="Next">
            <FiChevronRight size={20} />
          </button>
        </div>

        <h1 className="current-date">{getDateDisplay()}</h1>
      </div>

      <div className="header-right">
        <div className="view-selector">
          <button 
            className="view-button" 
            onClick={() => setShowViewDropdown(!showViewDropdown)}
          >
            {viewOptions.find(v => v.value === view)?.label}
            <FiChevronDown size={16} />
          </button>
          
          {showViewDropdown && (
            <>
              <div 
                className="dropdown-backdrop" 
                onClick={() => setShowViewDropdown(false)}
              />
              <div className="view-dropdown">
                {viewOptions.map(option => (
                  <div
                    key={option.value}
                    className={`view-option ${view === option.value ? 'active' : ''}`}
                    onClick={() => {
                      onViewChange(option.value);
                      setShowViewDropdown(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {view === option.value && <FiCheck size={16} />}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
