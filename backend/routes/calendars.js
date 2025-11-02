const express = require('express');
const router = express.Router();
const calendarsController = require('../controllers/calendarsController');

// Get all calendars
router.get('/', calendarsController.getCalendars);

// Get a single calendar by ID
router.get('/:id', calendarsController.getCalendarById);

// Create a new calendar
router.post('/', calendarsController.createCalendar);

// Update a calendar
router.put('/:id', calendarsController.updateCalendar);

// Delete a calendar
router.delete('/:id', calendarsController.deleteCalendar);

module.exports = router;
