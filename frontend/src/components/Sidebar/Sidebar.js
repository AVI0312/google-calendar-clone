import React from 'react';
import './Sidebar.css';
import { FiPlus } from 'react-icons/fi';
import MiniCalendar from './MiniCalendar';

const Sidebar = ({ currentDate, onDateSelect, onCreateEvent, collapsed }) => {
  if (collapsed) {
    return <div className="sidebar collapsed"></div>;
  }

  return (
    <aside className="sidebar">
      <button className="create-button" onClick={() => onCreateEvent()}>
        <div className="create-icon">
          <FiPlus size={24} />
        </div>
        <span>Create</span>
      </button>

      <MiniCalendar 
        currentDate={currentDate}
        onDateSelect={onDateSelect}
      />
    </aside>
  );
};

export default Sidebar;
