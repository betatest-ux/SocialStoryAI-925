import { getDatabase } from './connection';

export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  repliedAt?: string;
  adminReply?: string;
  userId?: string;
};

function rowToContactRequest(row: any): ContactRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status as 'pending' | 'in-progress' | 'resolved',
    createdAt: row.created_at,
    repliedAt: row.replied_at,
    adminReply: row.admin_reply,
    userId: row.user_id,
  };
}

export function createContactRequest(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
}): ContactRequest {
  const db = getDatabase();
  
  const requestId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO contact_requests (id, name, email, subject, message, status, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `);
  
  stmt.run(requestId, input.name, input.email, input.subject, input.message, createdAt, input.userId || null);
  
  const request = getContactRequest(requestId);
  if (!request) {
    throw new Error('Failed to create contact request');
  }
  
  return request;
}

export function getAllContactRequests(): ContactRequest[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC');
  const rows = stmt.all();
  
  return rows.map(rowToContactRequest);
}

export function getContactRequest(id: string): ContactRequest | undefined {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM contact_requests WHERE id = ? LIMIT 1');
  const row = stmt.get(id);
  
  return row ? rowToContactRequest(row) : undefined;
}

export function updateContactRequest(id: string, updates: Partial<ContactRequest>): void {
  const db = getDatabase();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.repliedAt !== undefined) {
    fields.push('replied_at = ?');
    values.push(updates.repliedAt);
  }
  if (updates.adminReply !== undefined) {
    fields.push('admin_reply = ?');
    values.push(updates.adminReply);
  }
  
  if (fields.length === 0) {
    return;
  }
  
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE contact_requests SET ${fields.join(', ')} WHERE id = ?
  `);
  
  stmt.run(...values);
}

export function deleteContactRequest(id: string): void {
  const db = getDatabase();
  
  const stmt = db.prepare('DELETE FROM contact_requests WHERE id = ?');
  stmt.run(id);
}
