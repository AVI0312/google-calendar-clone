const db = require('../config/database');

// Get all calendars
const getCalendars = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM calendars ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching calendars:', error);
    res.status(500).json({ error: 'Failed to fetch calendars' });
  }
};

// Get a single calendar by ID
const getCalendarById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM calendars WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
};

// Create a new calendar
const createCalendar = async (req, res) => {
  try {
    const { id, name, color, description, timezone, is_default } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name are required' });
    }

    const result = await db.query(
      `INSERT INTO calendars (id, name, color, description, timezone, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [id, name, color || '#1a73e8', description || null, timezone || 'UTC', is_default || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating calendar:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Calendar with this ID already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create calendar' });
  }
};

// Update a calendar
const updateCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description, timezone, is_default } = req.body;

    const checkResult = await db.query('SELECT * FROM calendars WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (color !== undefined) {
      updateFields.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (timezone !== undefined) {
      updateFields.push(`timezone = $${paramCount++}`);
      values.push(timezone);
    }
    if (is_default !== undefined) {
      updateFields.push(`is_default = $${paramCount++}`);
      values.push(is_default);
    }

    values.push(id);

    const query = `
      UPDATE calendars 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating calendar:', error);
    res.status(500).json({ error: 'Failed to update calendar' });
  }
};

// Delete a calendar
const deleteCalendar = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await db.query('SELECT * FROM calendars WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    // Prevent deletion of default calendar
    if (id === 'default') {
      return res.status(400).json({ error: 'Cannot delete the default calendar' });
    }

    // Delete all events associated with this calendar
    await db.query('DELETE FROM events WHERE calendar_id = $1', [id]);
    
    // Delete the calendar
    await db.query('DELETE FROM calendars WHERE id = $1', [id]);

    res.json({ message: 'Calendar deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    res.status(500).json({ error: 'Failed to delete calendar' });
  }
};

module.exports = {
  getCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  deleteCalendar,
};
