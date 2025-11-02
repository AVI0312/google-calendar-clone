const db = require('../config/database');
const { RRule, RRuleSet, rrulestr } = require('rrule');
const { parseISO, addDays, startOfDay, endOfDay, isBefore, isAfter, isWithinInterval } = require('date-fns');

// Get events within a date range
const getEvents = async (req, res) => {
  try {
    const { start, end, calendarId } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    let query = `
      SELECT * FROM events 
      WHERE (start_time >= $1 AND start_time <= $2)
         OR (end_time >= $1 AND end_time <= $2)
         OR (start_time <= $1 AND end_time >= $2)
    `;
    
    const params = [start, end];

    if (calendarId) {
      query += ' AND calendar_id = $3';
      params.push(calendarId);
    }

    query += ' AND parent_event_id IS NULL ORDER BY start_time ASC';

    const result = await db.query(query, params);

    // Expand recurring events
    const expandedEvents = [];
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    for (const event of result.rows) {
      if (event.is_recurring && event.recurrence_rule) {
        try {
          const rule = rrulestr(event.recurrence_rule, { 
            dtstart: new Date(event.start_time) 
          });

          const occurrences = rule.between(startDate, endDate, true);
          const exceptions = event.recurrence_exception || [];

          occurrences.forEach(occurrence => {
            const occurrenceStr = occurrence.toISOString();
            if (!exceptions.includes(occurrenceStr)) {
              const duration = new Date(event.end_time) - new Date(event.start_time);
              expandedEvents.push({
                ...event,
                id: `${event.id}_${occurrence.getTime()}`,
                original_id: event.id,
                start_time: occurrence.toISOString(),
                end_time: new Date(occurrence.getTime() + duration).toISOString(),
                is_instance: true,
              });
            }
          });
        } catch (error) {
          console.error('Error parsing recurrence rule:', error);
          expandedEvents.push(event);
        }
      } else {
        expandedEvents.push(event);
      }
    }

    res.json(expandedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get a single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      all_day,
      location,
      color,
      calendar_id,
      is_recurring,
      recurrence_rule,
      reminder_minutes,
      attendees,
      visibility,
    } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, start time, and end time are required' });
    }

    // Validate that end time is after start time
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const result = await db.query(
      `INSERT INTO events (
        title, description, start_time, end_time, all_day, location, 
        color, calendar_id, is_recurring, recurrence_rule, 
        reminder_minutes, attendees, visibility
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [
        title,
        description || null,
        start_time,
        end_time,
        all_day || false,
        location || null,
        color || '#1a73e8',
        calendar_id || 'default',
        is_recurring || false,
        recurrence_rule || null,
        reminder_minutes || [],
        attendees ? JSON.stringify(attendees) : '[]',
        visibility || 'default',
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      start_time,
      end_time,
      all_day,
      location,
      color,
      calendar_id,
      is_recurring,
      recurrence_rule,
      recurrence_exception,
      reminder_minutes,
      attendees,
      status,
      visibility,
    } = req.body;

    // Check if event exists
    const checkResult = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Validate times if provided
    if (start_time && end_time && new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (start_time !== undefined) {
      updateFields.push(`start_time = $${paramCount++}`);
      values.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push(`end_time = $${paramCount++}`);
      values.push(end_time);
    }
    if (all_day !== undefined) {
      updateFields.push(`all_day = $${paramCount++}`);
      values.push(all_day);
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (color !== undefined) {
      updateFields.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (calendar_id !== undefined) {
      updateFields.push(`calendar_id = $${paramCount++}`);
      values.push(calendar_id);
    }
    if (is_recurring !== undefined) {
      updateFields.push(`is_recurring = $${paramCount++}`);
      values.push(is_recurring);
    }
    if (recurrence_rule !== undefined) {
      updateFields.push(`recurrence_rule = $${paramCount++}`);
      values.push(recurrence_rule);
    }
    if (recurrence_exception !== undefined) {
      updateFields.push(`recurrence_exception = $${paramCount++}`);
      values.push(recurrence_exception);
    }
    if (reminder_minutes !== undefined) {
      updateFields.push(`reminder_minutes = $${paramCount++}`);
      values.push(reminder_minutes);
    }
    if (attendees !== undefined) {
      updateFields.push(`attendees = $${paramCount++}`);
      values.push(JSON.stringify(attendees));
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (visibility !== undefined) {
      updateFields.push(`visibility = $${paramCount++}`);
      values.push(visibility);
    }

    updateFields.push(`updated_at = $${paramCount++}`);
    values.push(new Date().toISOString());

    values.push(id);

    const query = `
      UPDATE events 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteType } = req.query; // 'single', 'future', 'all'

    const checkResult = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = checkResult.rows[0];

    if (event.is_recurring && deleteType === 'single') {
      // Add to exception list instead of deleting
      const result = await db.query(
        `UPDATE events 
         SET recurrence_exception = array_append(recurrence_exception, $1)
         WHERE id = $2
         RETURNING *`,
        [event.start_time, id]
      );
      res.json({ message: 'Event instance removed', event: result.rows[0] });
    } else {
      // Delete the event (will cascade to child events)
      await db.query('DELETE FROM events WHERE id = $1', [id]);
      res.json({ message: 'Event deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Check for event conflicts
const checkConflicts = async (req, res) => {
  try {
    const { start_time, end_time, event_id, calendar_id } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'Start and end times are required' });
    }

    let query = `
      SELECT * FROM events 
      WHERE (
        (start_time >= $1 AND start_time < $2)
        OR (end_time > $1 AND end_time <= $2)
        OR (start_time <= $1 AND end_time >= $2)
      )
    `;
    
    const params = [start_time, end_time];
    let paramCount = 3;

    if (event_id) {
      query += ` AND id != $${paramCount++}`;
      params.push(event_id);
    }

    if (calendar_id) {
      query += ` AND calendar_id = $${paramCount}`;
      params.push(calendar_id);
    }

    const result = await db.query(query, params);
    
    res.json({
      hasConflicts: result.rows.length > 0,
      conflicts: result.rows,
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
};

// Get recurring event instances
const getRecurringInstances = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    if (!event.is_recurring || !event.recurrence_rule) {
      return res.json([event]);
    }

    const rule = rrulestr(event.recurrence_rule, { 
      dtstart: new Date(event.start_time) 
    });

    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const occurrences = rule.between(startDate, endDate, true);
    const exceptions = event.recurrence_exception || [];

    const instances = occurrences
      .filter(occurrence => !exceptions.includes(occurrence.toISOString()))
      .map(occurrence => {
        const duration = new Date(event.end_time) - new Date(event.start_time);
        return {
          ...event,
          id: `${event.id}_${occurrence.getTime()}`,
          original_id: event.id,
          start_time: occurrence.toISOString(),
          end_time: new Date(occurrence.getTime() + duration).toISOString(),
          is_instance: true,
        };
      });

    res.json(instances);
  } catch (error) {
    console.error('Error fetching recurring instances:', error);
    res.status(500).json({ error: 'Failed to fetch recurring instances' });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  checkConflicts,
  getRecurringInstances,
};
