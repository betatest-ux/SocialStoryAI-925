#!/usr/bin/env node

import { getDatabase } from '../backend/db/connection';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  Export: bun database/export-import.ts export <output-file.sql>');
  console.log('  Import: bun database/export-import.ts import <input-file.sql>');
  process.exit(1);
}

const command = args[0];
const filePath = args[1] || join(process.cwd(), 'database', 'export.sql');

if (command === 'export') {
  try {
    console.log('Exporting database...');
    const db = getDatabase();
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
    
    let sqlDump = '-- SocialStoryAI Database Export\n';
    sqlDump += `-- Generated: ${new Date().toISOString()}\n\n`;
    sqlDump += 'BEGIN TRANSACTION;\n\n';
    
    for (const table of tables) {
      const createStmt = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table.name) as { sql: string };
      sqlDump += `-- Table: ${table.name}\n`;
      sqlDump += createStmt.sql + ';\n\n';
      
      const rows = db.prepare(`SELECT * FROM ${table.name}`).all() as Record<string, any>[];
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        
        for (const row of rows) {
          const values = columns.map(col => {
            const val = (row as any)[col];
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          
          sqlDump += `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlDump += '\n';
      }
    }
    
    const indexes = db.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").all() as { sql: string | null }[];
    if (indexes.length > 0) {
      sqlDump += '-- Indexes\n';
      for (const index of indexes) {
        if (index.sql) {
          sqlDump += index.sql + ';\n';
        }
      }
      sqlDump += '\n';
    }
    
    sqlDump += 'COMMIT;\n';
    
    writeFileSync(filePath, sqlDump, 'utf-8');
    
    console.log(`✅ Database exported successfully to: ${filePath}`);
    console.log(`File size: ${(sqlDump.length / 1024).toFixed(2)} KB`);
    console.log(`Tables exported: ${tables.length}`);
    
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
  
} else if (command === 'import') {
  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  try {
    console.log('Importing database...');
    console.log(`Reading from: ${filePath}`);
    
    const sqlDump = readFileSync(filePath, 'utf-8');
    const db = getDatabase();
    
    const statements = sqlDump
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      try {
        db.exec(statement);
      } catch {
        console.warn(`Warning: Failed to execute statement: ${statement.substring(0, 50)}...`);
      }
    }
    
    console.log('✅ Database imported successfully');
    
    const tables = db.prepare("SELECT name, COUNT(*) as count FROM sqlite_master WHERE type='table' GROUP BY name").all();
    console.log(`Tables imported: ${tables.length}`);
    
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
  
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Use "export" or "import"');
  process.exit(1);
}
