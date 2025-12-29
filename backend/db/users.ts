import bcrypt from 'bcryptjs';
import { getDatabase } from './connection';

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  isPremium: boolean;
  storiesGenerated: number;
  isAdmin: boolean;
  createdAt: string;
  subscriptionEndDate?: string;
  lastLoginAt?: string;
  googleId?: string;
  stripeCustomerId?: string;
};

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    isPremium: Boolean(row.is_premium),
    storiesGenerated: row.stories_generated,
    isAdmin: Boolean(row.is_admin),
    createdAt: row.created_at,
    subscriptionEndDate: row.subscription_end_date,
    lastLoginAt: row.last_login_at,
    googleId: row.google_id,
    stripeCustomerId: row.stripe_customer_id,
  };
}

export function getUserData(emailOrId: string): User | undefined {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM users WHERE email = ? OR id = ? LIMIT 1
  `);
  
  const row = stmt.get(emailOrId, emailOrId);
  return row ? rowToUser(row) : undefined;
}

export function createUser(input: {
  email: string;
  password: string;
  name: string;
  googleId?: string;
}): User {
  const db = getDatabase();
  const hashedPassword = bcrypt.hashSync(input.password, 10);
  
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, name, is_premium, stories_generated, is_admin, created_at, google_id)
    VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)
  `);
  
  stmt.run(userId, input.email, hashedPassword, input.name, createdAt, input.googleId || null);
  
  const user = getUserData(userId);
  if (!user) {
    throw new Error('Failed to create user');
  }
  
  return user;
}

export function updateUser(userId: string, updates: Partial<User>): void {
  const db = getDatabase();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.email !== undefined) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.password !== undefined) {
    fields.push('password = ?');
    values.push(updates.password);
  }
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.isPremium !== undefined) {
    fields.push('is_premium = ?');
    values.push(updates.isPremium ? 1 : 0);
  }
  if (updates.storiesGenerated !== undefined) {
    fields.push('stories_generated = ?');
    values.push(updates.storiesGenerated);
  }
  if (updates.isAdmin !== undefined) {
    fields.push('is_admin = ?');
    values.push(updates.isAdmin ? 1 : 0);
  }
  if (updates.subscriptionEndDate !== undefined) {
    fields.push('subscription_end_date = ?');
    values.push(updates.subscriptionEndDate);
  }
  if (updates.lastLoginAt !== undefined) {
    fields.push('last_login_at = ?');
    values.push(updates.lastLoginAt);
  }
  if (updates.googleId !== undefined) {
    fields.push('google_id = ?');
    values.push(updates.googleId);
  }
  if (updates.stripeCustomerId !== undefined) {
    fields.push('stripe_customer_id = ?');
    values.push(updates.stripeCustomerId);
  }
  
  if (fields.length === 0) {
    return;
  }
  
  values.push(userId);
  
  const stmt = db.prepare(`
    UPDATE users SET ${fields.join(', ')} WHERE id = ?
  `);
  
  stmt.run(...values);
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  const rows = stmt.all();
  
  return rows.map(rowToUser);
}

export function deleteUser(userId: string): void {
  const db = getDatabase();
  
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(userId);
}

export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export function updatePassword(userId: string, newPassword: string): void {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  updateUser(userId, { password: hashedPassword });
}

export function getUserByGoogleId(googleId: string): User | undefined {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM users WHERE google_id = ? LIMIT 1');
  const row = stmt.get(googleId);
  
  return row ? rowToUser(row) : undefined;
}

export function initializeDefaultAdmin() {
  const db = getDatabase();
  
  const existingAdmin = getUserData('admin@socialstoryai.com');
  
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const createdAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, is_premium, stories_generated, is_admin, created_at)
      VALUES ('admin', ?, ?, 'Admin', 1, 0, 1, ?)
    `);
    
    stmt.run('admin@socialstoryai.com', hashedPassword, createdAt);
    console.log('✅ Default admin user created');
  }
}
