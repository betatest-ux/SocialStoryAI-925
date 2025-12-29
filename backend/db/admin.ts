import { getDatabase } from './connection';

export type ApiKeys = {
  id: string;
  openaiKey?: string;
  geminiKey?: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  googleOAuthWebClientId?: string;
  googleOAuthIosClientId?: string;
  googleOAuthAndroidClientId?: string;
  mailHost?: string;
  mailPort?: number;
  mailUser?: string;
  mailPassword?: string;
  mailFrom?: string;
  jwtSecret?: string;
  updatedAt: string;
};

export type AdminSettings = {
  id: string;
  freeStoryLimit: number;
  enableRegistration: boolean;
  maintenanceMode: boolean;
  premiumPrice: number;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  details: string;
};

function rowToApiKeys(row: any): ApiKeys {
  return {
    id: row.id,
    openaiKey: row.openai_key,
    geminiKey: row.gemini_key,
    stripeSecretKey: row.stripe_secret_key,
    stripePublishableKey: row.stripe_publishable_key,
    googleOAuthWebClientId: row.google_oauth_web_client_id,
    googleOAuthIosClientId: row.google_oauth_ios_client_id,
    googleOAuthAndroidClientId: row.google_oauth_android_client_id,
    mailHost: row.mail_host,
    mailPort: row.mail_port,
    mailUser: row.mail_user,
    mailPassword: row.mail_password,
    mailFrom: row.mail_from,
    jwtSecret: row.jwt_secret,
    updatedAt: row.updated_at,
  };
}

function rowToAdminSettings(row: any): AdminSettings {
  return {
    id: row.id,
    freeStoryLimit: row.free_story_limit,
    enableRegistration: Boolean(row.enable_registration),
    maintenanceMode: Boolean(row.maintenance_mode),
    premiumPrice: row.premium_price,
    updatedAt: row.updated_at,
  };
}

function rowToActivityLog(row: any): ActivityLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    action: row.action,
    userId: row.user_id,
    details: row.details,
  };
}

export function getApiKeys(): ApiKeys {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM api_keys WHERE id = 'default' LIMIT 1");
  const row = stmt.get();
  
  if (!row) {
    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT INTO api_keys (id, updated_at) VALUES ('default', ?)
    `);
    insertStmt.run(now);
    
    return {
      id: 'default',
      updatedAt: now,
    };
  }
  
  return rowToApiKeys(row);
}

export function updateApiKeys(updates: Partial<ApiKeys>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  const fieldMap: Record<string, string> = {
    openaiKey: 'openai_key',
    geminiKey: 'gemini_key',
    stripeSecretKey: 'stripe_secret_key',
    stripePublishableKey: 'stripe_publishable_key',
    googleOAuthWebClientId: 'google_oauth_web_client_id',
    googleOAuthIosClientId: 'google_oauth_ios_client_id',
    googleOAuthAndroidClientId: 'google_oauth_android_client_id',
    mailHost: 'mail_host',
    mailPort: 'mail_port',
    mailUser: 'mail_user',
    mailPassword: 'mail_password',
    mailFrom: 'mail_from',
    jwtSecret: 'jwt_secret',
  };
  
  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (updates[key as keyof ApiKeys] !== undefined) {
      fields.push(`${dbField} = ?`);
      values.push(updates[key as keyof ApiKeys]);
    }
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    const stmt = db.prepare(`UPDATE api_keys SET ${fields.join(', ')} WHERE id = 'default'`);
    stmt.run(...values);
  }
}

export function getAdminSettings(): AdminSettings {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM admin_settings WHERE id = 'default' LIMIT 1");
  const row = stmt.get();
  
  if (!row) {
    throw new Error('Admin settings not found');
  }
  
  return rowToAdminSettings(row);
}

export function updateAdminSettings(updates: Partial<AdminSettings>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.freeStoryLimit !== undefined) {
    fields.push('free_story_limit = ?');
    values.push(updates.freeStoryLimit);
  }
  if (updates.enableRegistration !== undefined) {
    fields.push('enable_registration = ?');
    values.push(updates.enableRegistration ? 1 : 0);
  }
  if (updates.maintenanceMode !== undefined) {
    fields.push('maintenance_mode = ?');
    values.push(updates.maintenanceMode ? 1 : 0);
  }
  if (updates.premiumPrice !== undefined) {
    fields.push('premium_price = ?');
    values.push(updates.premiumPrice);
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    const stmt = db.prepare(`UPDATE admin_settings SET ${fields.join(', ')} WHERE id = 'default'`);
    stmt.run(...values);
  }
}

export function addActivityLog(action: string, userId: string, details: string): void {
  const db = getDatabase();
  const logId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const stmt = db.prepare(`
    INSERT INTO activity_logs (id, timestamp, action, user_id, details)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(logId, Date.now(), action, userId, details);
  
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM activity_logs');
  const result = countStmt.get() as { count: number };
  
  if (result.count > 100) {
    const deleteStmt = db.prepare(`
      DELETE FROM activity_logs WHERE id IN (
        SELECT id FROM activity_logs ORDER BY timestamp ASC LIMIT ?
      )
    `);
    deleteStmt.run(result.count - 100);
  }
}

export function getActivityLogs(): ActivityLog[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
  const rows = stmt.all();
  return rows.map(rowToActivityLog);
}
