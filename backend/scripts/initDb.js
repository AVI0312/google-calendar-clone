const db = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');

    // Create events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        all_day BOOLEAN DEFAULT FALSE,
        location VARCHAR(255),
        color VARCHAR(50) DEFAULT '#1a73e8',
        calendar_id VARCHAR(100) DEFAULT 'default',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_rule TEXT,
        recurrence_exception TEXT[],
        parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        original_start_time TIMESTAMP WITH TIME ZONE,
        reminder_minutes INTEGER[],
        attendees JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'confirmed',
        visibility VARCHAR(50) DEFAULT 'default'
      );
    `);

    console.log('Events table created successfully');

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
      CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
      CREATE INDEX IF NOT EXISTS idx_events_calendar_id ON events(calendar_id);
      CREATE INDEX IF NOT EXISTS idx_events_parent_id ON events(parent_event_id);
    `);

    console.log('Indexes created successfully');

    // Create calendars table (for multi-calendar support)
    await db.query(`
      CREATE TABLE IF NOT EXISTS calendars (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) DEFAULT '#1a73e8',
        description TEXT,
        timezone VARCHAR(100) DEFAULT 'UTC',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Calendars table created successfully');

    // Insert default calendar if not exists
    await db.query(`
      INSERT INTO calendars (id, name, color, is_default)
      VALUES ('default', 'My Calendar', '#1a73e8', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Default calendar created successfully');

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
