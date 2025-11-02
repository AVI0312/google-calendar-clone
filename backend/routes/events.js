const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// Get all events within a date range
router.get('/', eventsController.getEvents);

// Get a single event by ID
router.get('/:id', eventsController.getEventById);

// Create a new event
router.post('/', eventsController.createEvent);

// Update an event
router.put('/:id', eventsController.updateEvent);

// Delete an event
router.delete('/:id', eventsController.deleteEvent);

// Check for event conflicts
router.post('/check-conflicts', eventsController.checkConflicts);

// Get recurring event instances
router.get('/:id/instances', eventsController.getRecurringInstances);

module.exports = router;
