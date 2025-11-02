# Google Calendar Clone

A high-fidelity fullstack clone of Google Calendar built with React, Node.js, Express, and PostgreSQL.

**Created by:** Arpit  
**Repository:** https://github.com/Naman-Bhalla/ | https://github.com/raun/

---

## 📋 Table of Contents

1. [Setup and Run Instructions](#setup-and-run-instructions)
2. [Architecture and Technology Choices](#architecture-and-technology-choices)
3. [Business Logic and Edge Cases](#business-logic-and-edge-cases)
4. [Animations and Interactions](#animations-and-interactions)
5. [Future Enhancements](#future-enhancements)

---

## 🎯 Features

- **Multiple Views**: Month, Week, and Day calendar views
- **Event CRUD**: Create, edit, delete events with modal interface
- **Recurring Events**: Support for repeating patterns (RRule)
- **Conflict Detection**: Automatic overlap detection
- **Responsive Design**: Mobile-friendly interface
- **Color Coding**: 10 event colors for categorization

---

## 🚀 Setup and Run Instructions

### Prerequisites
- **Node.js** v14+ 
- **PostgreSQL** v12+

### 1. Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE calendar_db;
\q
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure .env file
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendar_db
DB_USER=postgres
DB_PASSWORD=your_password

# Initialize database and start server
npm run init-db
npm run dev
```
Backend runs on **http://localhost:5000**

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run start
```
Frontend runs on **http://localhost:3000**

### 🎯 Quick Setup (Automated Scripts)

For convenience, automated scripts are provided to set up and run the entire project:

**Windows:**
```bash
# Step 1: Run setup (installs dependencies and initializes database)
setup.bat

# Step 2: Start both servers
start-app.bat
```

**Mac/Linux:**
```bash
# Make scripts executable (one-time)
chmod +x setup.sh start-app.sh

# Step 1: Run setup
./setup.sh

# Step 2: Start both servers
./start-app.sh
```

**What these scripts do:**
- `setup.bat/.sh` - Installs all dependencies (backend + frontend) and initializes the database
- `start-app.bat/.sh` - Starts both backend and frontend servers in separate terminal windows

**Note:** Ensure PostgreSQL is running and you've configured `backend/.env` before running the setup script.

---

## 🏗️ Architecture and Technology Choices

### System Architecture
```
React Frontend (localhost:3000)
    ↕️ REST API
Express Backend (localhost:5000)
    ↕️ SQL Queries
PostgreSQL Database (localhost:5432)
```

### Technology Stack

**Frontend:**
- **React 18.2.0** - Component-based UI, Virtual DOM for efficient rendering
- **date-fns 2.30.0** - Modern date manipulation library
- **Axios 1.6.2** - HTTP client for API calls
- **CSS3** - Custom animations and responsive design

**Backend:**
- **Node.js + Express 4.18.2** - RESTful API server
- **PostgreSQL 12+** - ACID compliance, timezone support, JSON fields
- **RRule 2.7.2** - Recurring event pattern library
- **pg 8.11.3** - PostgreSQL client

### Key Design Decisions

**1. Date Handling**
- Store all dates in UTC (`TIMESTAMP WITH TIME ZONE`)
- Convert to local timezone on frontend
- Prevents timezone/DST issues

**2. Recurring Events**
- Store RRule pattern, expand on query (not individual instances)
- Efficient storage, flexible modifications
- Example: `FREQ=WEEKLY;BYDAY=MO,WE,FR`

**3. API Design**
- RESTful endpoints: GET, POST, PUT, DELETE
- JSON request/response format
- Consistent error handling

**4. Component Structure**
```
App
├── Header (view switcher)
├── Sidebar (mini calendar)
├── Calendar Views (Month/Week/Day)
└── EventModal (CRUD operations)
```

**5. State Management**
- React useState (no Redux needed for this scope)
- Props passing for 2-3 levels maximum

---

## 🧠 Business Logic and Edge Cases

### 1. Event Time Validation
**Rule:** End time must be after start time

**Implementation:**
```javascript
if (new Date(end_time) <= new Date(start_time)) {
  return res.status(400).json({ error: 'End time must be after start time' });
}
```

**Edge Cases:**
- Timezone-aware comparison
- Past dates allowed for historical events
- Far future dates accepted

### 2. Recurring Events
**Implementation:** Using RRule library

```javascript
const rule = new RRule({
  freq: RRule.WEEKLY,
  interval: 1,
  byweekday: [RRule.MO, RRule.WE],
  dtstart: new Date('2025-11-03'),
  until: new Date('2025-12-31')
});
```

**Edge Cases Handled:**
- DST transitions adjust automatically
- Leap years (Feb 29) handled
- Month-end patterns ("last day of month")
- Complex patterns ("first Monday of every month")
- Individual instance deletion

### 3. Conflict Detection
**Algorithm:** Interval overlap detection

```sql
SELECT * FROM events 
WHERE start_time < $endTime AND end_time > $startTime
```

**Edge Cases:**
- Exact time matches count as conflicts
- All-day events conflict with any same-day event
- Own event excluded (for edits)
- B-tree indexes for O(log n) performance

### 4. All-Day Events
**Storage:**
```javascript
{
  start_time: '2025-11-05T00:00:00Z',
  end_time: '2025-11-05T23:59:59Z',
  all_day: true
}
```

**Edge Cases:**
- Multi-day spanning
- Timezone-independent display
- Always appear first when sorting

### 5. Event Overlap Layout
**Algorithm:** Column-based visual layout

```javascript
// Overlapping events share horizontal space
function layoutEvent(event, group) {
  return {
    width: `${100 / group.length}%`,
    left: `${(100 / group.length) * index}%`
  };
}
```

**Handles:** 2+ overlapping events divide space equally

### 6. Timezone Handling
**Strategy:** Store UTC, display local

```javascript
// Backend: TIMESTAMP WITH TIME ZONE (UTC)
// Frontend: date-fns automatically uses browser timezone
```

**Edge Cases:**
- DST transitions handled
- International events display correctly
- Date boundary (midnight) edge cases

---

## 🎨 Animations and Interactions

### CSS Animations

**1. Fade In** (200ms) - Modal entrance
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**2. Slide Up** (300ms) - EventModal entrance
```css
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**3. Slide Down** (200ms) - Dropdown menus
```css
@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Hover Effects

```css
/* Date cells - background change */
.month-day-cell:hover {
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

/* Events - lift effect */
.event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

/* Buttons - scale effect */
.button:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}

/* Button press */
.button:active {
  transform: scale(0.98);
}
```

### Interactive Features

**Event Click:** Opens modal with event details + slide-up animation  
**Date Click:** Opens modal pre-filled with selected date/time  
**View Switching:** Month/Week/Day buttons with active state highlighting  
**Navigation:** Prev/Next buttons and mini calendar date selection

### Performance Optimizations

**GPU Acceleration:**
```css
/* Use transform (GPU) instead of top/left (CPU) */
.modal { transform: translateY(20px); }
```

**React Optimizations:**
- `React.memo()` - Prevent unnecessary event re-renders
- `useCallback()` - Memoize event handlers
- `useMemo()` - Cache sorted event arrays

**Accessibility:**
```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## 🚀 Future Enhancements

### High Priority

**1. Drag & Drop Events**
- Move events between dates/times by dragging
- Implementation: React DnD library

**2. Event Resizing**
- Adjust duration by dragging event edges
- Quick duration changes without modal

**3. Search & Filter**
- Full-text search by title/description/location
- PostgreSQL full-text search

**4. Multiple Timezones**
- Display events in different timezones
- Useful for international teams

**5. Event Reminders**
- Email/push notifications before events
- Background job scheduler (node-cron)

**6. Authentication & Authorization**
- User login/signup with JWT tokens
- Per-user calendars and events

### Medium Priority

**7. Recurring Event Editing**
- Edit single instance, future, or all
- Complex but essential for flexibility

**8. Calendar Sharing**
- Share calendars with other users
- Permissions system for collaboration

**9. Import/Export (ICS)**
- Compatibility with Google Calendar, Outlook
- ical.js library for parsing

**10. Event Templates**
- Quick-create from predefined templates
- Save time on repetitive events

**11. Dark Mode**
- CSS variables for theme switching
- Reduced eye strain

**12. Real-time Sync**
- WebSockets (Socket.io) for live updates
- Multi-device synchronization

### Technical Improvements

**Testing:** Jest (unit), Cypress (E2E), 80%+ coverage  
**CI/CD:** GitHub Actions, automated deployment  
**Performance:** Virtual scrolling, Redis caching, lazy loading  
**Offline Support:** Service Workers, IndexedDB

---

**Created by:** Arpit Panwar
