import { getDatabase } from './connection';

export type Story = {
  id: string;
  userId: string;
  childName: string;
  situation: string;
  complexity: string;
  tone: string;
  imageStyle: string;
  content: string;
  images: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
};

function rowToStory(row: any): Story {
  return {
    id: row.id,
    userId: row.user_id,
    childName: row.child_name,
    situation: row.situation,
    complexity: row.complexity,
    tone: row.tone,
    imageStyle: row.image_style,
    content: row.content,
    images: JSON.parse(row.images),
    videoUrl: row.video_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createStory(input: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Story {
  const db = getDatabase();
  
  const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO stories (id, user_id, child_name, situation, complexity, tone, image_style, content, images, video_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    storyId,
    input.userId,
    input.childName,
    input.situation,
    input.complexity,
    input.tone,
    input.imageStyle,
    input.content,
    JSON.stringify(input.images),
    input.videoUrl || null,
    now,
    now
  );
  
  const story = getStory(storyId);
  if (!story) {
    throw new Error('Failed to create story');
  }
  
  return story;
}

export function getStory(id: string): Story | undefined {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM stories WHERE id = ? LIMIT 1');
  const row = stmt.get(id);
  
  return row ? rowToStory(row) : undefined;
}

export function getUserStories(userId: string): Story[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM stories WHERE user_id = ? ORDER BY created_at DESC
  `);
  
  const rows = stmt.all(userId);
  return rows.map(rowToStory);
}

export function updateStory(id: string, updates: Partial<Story>): void {
  const db = getDatabase();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.childName !== undefined) {
    fields.push('child_name = ?');
    values.push(updates.childName);
  }
  if (updates.situation !== undefined) {
    fields.push('situation = ?');
    values.push(updates.situation);
  }
  if (updates.complexity !== undefined) {
    fields.push('complexity = ?');
    values.push(updates.complexity);
  }
  if (updates.tone !== undefined) {
    fields.push('tone = ?');
    values.push(updates.tone);
  }
  if (updates.imageStyle !== undefined) {
    fields.push('image_style = ?');
    values.push(updates.imageStyle);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.images !== undefined) {
    fields.push('images = ?');
    values.push(JSON.stringify(updates.images));
  }
  if (updates.videoUrl !== undefined) {
    fields.push('video_url = ?');
    values.push(updates.videoUrl);
  }
  
  if (fields.length === 0) {
    return;
  }
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE stories SET ${fields.join(', ')} WHERE id = ?
  `);
  
  stmt.run(...values);
}

export function deleteStory(id: string): void {
  const db = getDatabase();
  
  const stmt = db.prepare('DELETE FROM stories WHERE id = ?');
  stmt.run(id);
}

export function getAllStories(): Story[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM stories ORDER BY created_at DESC');
  const rows = stmt.all();
  
  return rows.map(rowToStory);
}
