import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'prevail.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
export function initDB() {
  // Locations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      hours_open TEXT NOT NULL,
      hours_close TEXT NOT NULL,
      num_tables INTEGER DEFAULT 1,
      square_location_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      party_size INTEGER DEFAULT 6,
      status TEXT DEFAULT 'pending',
      payment_id TEXT,
      payment_amount INTEGER DEFAULT 500,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    )
  `);

  // Blocked times table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocked_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      reason TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (created_by) REFERENCES managers(id)
    )
  `);

  // Managers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS managers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      location_ids TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bookings_location_date 
    ON bookings(location_id, booking_date);
    
    CREATE INDEX IF NOT EXISTS idx_bookings_email 
    ON bookings(customer_email);
    
    CREATE INDEX IF NOT EXISTS idx_blocked_times_location_date 
    ON blocked_times(location_id, date);
  `);

  console.log('✓ Database initialized');
}

// Seed data (placeholder locations)
export function seedDB() {
  const existingLocations = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
  
  if (existingLocations.count === 0) {
    const insertLocation = db.prepare(`
      INSERT INTO locations (name, address, city, state, zip, hours_open, hours_close, num_tables)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const locations = [
      ['Downtown Auburn', '123 Main Street', 'Auburn', 'AL', '36830', '07:00', '18:00', 1],
      ['West Midtown Atlanta', '456 Howell Mill Rd', 'Atlanta', 'GA', '30318', '07:00', '19:00', 1],
      ['Star Metals Atlanta', '789 Star Metals Way', 'Atlanta', 'GA', '30318', '07:00', '19:00', 1],
    ];

    const insertMany = db.transaction((locs: any[]) => {
      for (const loc of locs) {
        insertLocation.run(...loc);
      }
    });

    insertMany(locations);

    console.log('✓ Seed data inserted (3 placeholder locations)');
  }
}

// Initialize on import
initDB();
seedDB();
