import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'database', 'socialstoryai.db');
    
    try {
      db = new Database(dbPath, { verbose: console.log });
      
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      
      initializeDatabase(db);
      
      console.log(`✅ Database connected successfully at ${dbPath}`);
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw new Error('Database connection failed');
    }
  }
  
  return db;
}

function initializeDatabase(database: Database.Database) {
  try {
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      database.exec(statement);
    }
    
    const defaultSettingsExists = database
      .prepare("SELECT COUNT(*) as count FROM admin_settings WHERE id = 'default'")
      .get() as { count: number };
    
    if (defaultSettingsExists.count === 0) {
      database.prepare(`
        INSERT INTO admin_settings (id, free_story_limit, enable_registration, maintenance_mode, premium_price, updated_at)
        VALUES ('default', 3, 1, 0, 9.99, ?)
      `).run(new Date().toISOString());
    }
    
    const defaultThemeExists = database
      .prepare("SELECT COUNT(*) as count FROM theme_settings WHERE id = 'default'")
      .get() as { count: number };
    
    if (defaultThemeExists.count === 0) {
      database.prepare(`
        INSERT INTO theme_settings (id, primary_color, secondary_color, accent_color, background_color, text_color,
          header_background_color, header_text_color, footer_background_color, footer_text_color,
          button_background_color, button_text_color, border_radius, font_size, font_family,
          header_height, footer_height, updated_at)
        VALUES ('default', '#6366F1', '#8B5CF6', '#EC4899', '#FFFFFF', '#1F2937',
          '#FFFFFF', '#1F2937', '#F9FAFB', '#6B7280',
          '#6366F1', '#FFFFFF', 12, 16, 'System',
          60, 80, ?)
      `).run(new Date().toISOString());
    }
    
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    throw error;
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
}

export function createBackup(backupPath: string) {
  if (!db) {
    throw new Error('Database not connected');
  }
  
  try {
    db.backup(backupPath);
    console.log(`✅ Database backup created at ${backupPath}`);
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
}
