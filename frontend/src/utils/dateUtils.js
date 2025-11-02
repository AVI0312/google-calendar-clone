import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
  endOfDay,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  differenceInMinutes,
  addMinutes,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';

export const dateUtils = {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
  endOfDay,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  differenceInMinutes,
  addMinutes,
  isWithinInterval,
  isBefore,
  isAfter,
};

// Generate array of days for month view
export const getDaysInMonth = (date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  return days;
};

// Generate array of days for week view
export const getDaysInWeek = (date) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const days = [];

  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekStart, i));
  }

  return days;
};

// Generate time slots for day/week view (30 min intervals)
export const getTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const date = setMinutes(setHours(new Date(), hour), minute);
      const displayLabel = minute === 0 ? format(date, 'h a') : '';
      slots.push({
        time: format(date, 'HH:mm'),
        label: format(date, 'h:mm a'),
        displayLabel: displayLabel,
      });
    }
  }
  return slots;
};

// Calculate event position and height for day/week view
export const calculateEventPosition = (event, dayStart) => {
  const eventStart = parseISO(event.start_time);
  const eventEnd = parseISO(event.end_time);
  
  const dayStartTime = startOfDay(dayStart);
  const minutesFromStart = differenceInMinutes(eventStart, dayStartTime);
  const duration = differenceInMinutes(eventEnd, eventStart);
  
  const top = (minutesFromStart / 30) * 48; // 48px per 30min slot
  const height = Math.max((duration / 30) * 48, 24); // Minimum 24px height
  
  return { top, height };
};

// Check if events overlap
export const eventsOverlap = (event1, event2) => {
  const start1 = parseISO(event1.start_time);
  const end1 = parseISO(event1.end_time);
  const start2 = parseISO(event2.start_time);
  const end2 = parseISO(event2.end_time);
  
  return (start1 < end2 && end1 > start2);
};

// Group overlapping events for column layout
export const groupOverlappingEvents = (events) => {
  if (events.length === 0) return [];
  
  const sorted = [...events].sort((a, b) => 
    parseISO(a.start_time) - parseISO(b.start_time)
  );
  
  const groups = [];
  let currentGroup = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const hasOverlap = currentGroup.some(event => 
      eventsOverlap(event, sorted[i])
    );
    
    if (hasOverlap) {
      currentGroup.push(sorted[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
    }
  }
  
  groups.push(currentGroup);
  return groups;
};

// Calculate event layout (left position and width) for overlapping events
export const calculateEventLayout = (event, events) => {
  const overlapping = events.filter(e => 
    e.id !== event.id && eventsOverlap(e, event)
  );
  
  if (overlapping.length === 0) {
    return { left: 0, width: 100 };
  }
  
  const allEvents = [event, ...overlapping].sort((a, b) => 
    parseISO(a.start_time) - parseISO(b.start_time)
  );
  
  const columns = allEvents.length;
  const index = allEvents.findIndex(e => e.id === event.id);
  const width = 100 / columns;
  const left = width * index;
  
  return { left: `${left}%`, width: `${width}%` };
};

// Format time range for display
export const formatTimeRange = (startTime, endTime, allDay = false) => {
  if (allDay) {
    return 'All day';
  }
  
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  
  if (isSameDay(start, end)) {
    return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  } else {
    return `${format(start, 'MMM d, h:mm a')} – ${format(end, 'MMM d, h:mm a')}`;
  }
};

// Get events for a specific day
export const getEventsForDay = (events, day) => {
  return events.filter(event => {
    const eventStart = parseISO(event.start_time);
    const eventEnd = parseISO(event.end_time);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    
    return (
      isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
      (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd))
    );
  });
};

export default dateUtils;
