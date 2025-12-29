import { getDatabase } from '../db/connection';

const RATE_LIMITS = {
  login: { max: 5, window: 15 * 60 * 1000 },
  register: { max: 3, window: 60 * 60 * 1000 },
  api: { max: 100, window: 60 * 1000 },
};

export function checkRateLimit(identifier: string, endpoint: string): boolean {
  const db = getDatabase();
  const now = Date.now();
  
  const cleanupStmt = db.prepare('DELETE FROM rate_limits WHERE reset_at < ?');
  cleanupStmt.run(now);
  
  const stmt = db.prepare(`
    SELECT count, reset_at FROM rate_limits 
    WHERE identifier = ? AND endpoint = ?
    LIMIT 1
  `);
  
  const existing = stmt.get(identifier, endpoint) as { count: number; reset_at: number } | undefined;
  
  const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.api;
  
  if (existing) {
    if (now > existing.reset_at) {
      const deleteStmt = db.prepare('DELETE FROM rate_limits WHERE identifier = ? AND endpoint = ?');
      deleteStmt.run(identifier, endpoint);
      
      const insertStmt = db.prepare(`
        INSERT INTO rate_limits (id, identifier, endpoint, count, reset_at, created_at)
        VALUES (?, ?, ?, 1, ?, ?)
      `);
      insertStmt.run(
        `${identifier}_${endpoint}_${now}`,
        identifier,
        endpoint,
        now + limit.window,
        new Date().toISOString()
      );
      
      return true;
    }
    
    if (existing.count >= limit.max) {
      return false;
    }
    
    const updateStmt = db.prepare(`
      UPDATE rate_limits SET count = count + 1
      WHERE identifier = ? AND endpoint = ?
    `);
    updateStmt.run(identifier, endpoint);
    
    return true;
  }
  
  const insertStmt = db.prepare(`
    INSERT INTO rate_limits (id, identifier, endpoint, count, reset_at, created_at)
    VALUES (?, ?, ?, 1, ?, ?)
  `);
  insertStmt.run(
    `${identifier}_${endpoint}_${now}`,
    identifier,
    endpoint,
    now + limit.window,
    new Date().toISOString()
  );
  
  return true;
}

export function getRateLimitInfo(identifier: string, endpoint: string): { remaining: number; resetAt: number } | null {
  const db = getDatabase();
  const now = Date.now();
  
  const stmt = db.prepare(`
    SELECT count, reset_at FROM rate_limits 
    WHERE identifier = ? AND endpoint = ?
    LIMIT 1
  `);
  
  const existing = stmt.get(identifier, endpoint) as { count: number; reset_at: number } | undefined;
  const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.api;
  
  if (!existing || now > existing.reset_at) {
    return { remaining: limit.max, resetAt: now + limit.window };
  }
  
  return {
    remaining: Math.max(0, limit.max - existing.count),
    resetAt: existing.reset_at,
  };
}
