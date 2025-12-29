import { getDatabase } from './connection';

type PageContent = {
  id: string;
  pageId: string;
  sectionId: string;
  type: 'text' | 'heading' | 'html' | 'image' | 'button';
  content: string;
  order: number;
  styles?: Record<string, any>;
  metadata?: Record<string, any>;
  updatedAt: string;
};

type Page = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  showInMenu: boolean;
  menuOrder: number;
  showHeader: boolean;
  showFooter: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
};

type ThemeSettings = {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
  headerHeight: number;
  footerHeight: number;
  customCSS?: string;
  updatedAt: string;
};

type HeaderFooterContent = {
  id: string;
  type: 'header' | 'footer';
  content: string;
  logo?: string;
  links?: { label: string; url: string; icon?: string }[];
  showSearch: boolean;
  showUserMenu: boolean;
  customHTML?: string;
  updatedAt: string;
};

function rowToPage(row: any): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    isPublished: Boolean(row.is_published),
    showInMenu: Boolean(row.show_in_menu),
    menuOrder: row.menu_order,
    showHeader: Boolean(row.show_header),
    showFooter: Boolean(row.show_footer),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  };
}

function rowToPageContent(row: any): PageContent {
  return {
    id: row.id,
    pageId: row.page_id,
    sectionId: row.section_id,
    type: row.type,
    content: row.content,
    order: row.order_num,
    styles: row.styles ? JSON.parse(row.styles) : undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    updatedAt: row.updated_at,
  };
}

function rowToThemeSettings(row: any): ThemeSettings {
  return {
    id: row.id,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    accentColor: row.accent_color,
    backgroundColor: row.background_color,
    textColor: row.text_color,
    headerBackgroundColor: row.header_background_color,
    headerTextColor: row.header_text_color,
    footerBackgroundColor: row.footer_background_color,
    footerTextColor: row.footer_text_color,
    buttonBackgroundColor: row.button_background_color,
    buttonTextColor: row.button_text_color,
    borderRadius: row.border_radius,
    fontSize: row.font_size,
    fontFamily: row.font_family,
    headerHeight: row.header_height,
    footerHeight: row.footer_height,
    customCSS: row.custom_css,
    updatedAt: row.updated_at,
  };
}

function rowToHeaderFooterContent(row: any): HeaderFooterContent {
  return {
    id: row.id,
    type: row.type,
    content: row.content,
    logo: row.logo,
    links: row.links ? JSON.parse(row.links) : undefined,
    showSearch: Boolean(row.show_search),
    showUserMenu: Boolean(row.show_user_menu),
    customHTML: row.custom_html,
    updatedAt: row.updated_at,
  };
}

export function getAllPages(): Page[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM pages ORDER BY menu_order ASC');
  const rows = stmt.all();
  return rows.map(rowToPage);
}

export function getPage(slugOrId: string): Page | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM pages WHERE slug = ? OR id = ? LIMIT 1');
  const row = stmt.get(slugOrId, slugOrId);
  return row ? rowToPage(row) : undefined;
}

export function createPage(input: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Page {
  const db = getDatabase();
  const pageId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO pages (id, slug, title, is_published, show_in_menu, menu_order, show_header, show_footer, created_at, updated_at, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    pageId,
    input.slug,
    input.title,
    input.isPublished ? 1 : 0,
    input.showInMenu ? 1 : 0,
    input.menuOrder,
    input.showHeader ? 1 : 0,
    input.showFooter ? 1 : 0,
    now,
    now,
    input.metadata ? JSON.stringify(input.metadata) : null
  );
  
  const page = getPage(pageId);
  if (!page) throw new Error('Failed to create page');
  return page;
}

export function updatePage(pageId: string, updates: Partial<Page>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.slug !== undefined) {
    fields.push('slug = ?');
    values.push(updates.slug);
  }
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.isPublished !== undefined) {
    fields.push('is_published = ?');
    values.push(updates.isPublished ? 1 : 0);
  }
  if (updates.showInMenu !== undefined) {
    fields.push('show_in_menu = ?');
    values.push(updates.showInMenu ? 1 : 0);
  }
  if (updates.menuOrder !== undefined) {
    fields.push('menu_order = ?');
    values.push(updates.menuOrder);
  }
  if (updates.showHeader !== undefined) {
    fields.push('show_header = ?');
    values.push(updates.showHeader ? 1 : 0);
  }
  if (updates.showFooter !== undefined) {
    fields.push('show_footer = ?');
    values.push(updates.showFooter ? 1 : 0);
  }
  if (updates.metadata !== undefined) {
    fields.push('metadata = ?');
    values.push(JSON.stringify(updates.metadata));
  }
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(pageId);
  
  const stmt = db.prepare(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deletePage(pageId: string): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM pages WHERE id = ?');
  stmt.run(pageId);
}

export function getPageContents(pageId: string): PageContent[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM page_contents WHERE page_id = ? ORDER BY order_num ASC');
  const rows = stmt.all(pageId);
  return rows.map(rowToPageContent);
}

export function getPageContentsBySection(pageId: string, sectionId: string): PageContent[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM page_contents WHERE page_id = ? AND section_id = ? ORDER BY order_num ASC');
  const rows = stmt.all(pageId, sectionId);
  return rows.map(rowToPageContent);
}

export function createPageContent(input: Omit<PageContent, 'id' | 'updatedAt'>): PageContent {
  const db = getDatabase();
  const contentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO page_contents (id, page_id, section_id, type, content, order_num, styles, metadata, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    contentId,
    input.pageId,
    input.sectionId,
    input.type,
    input.content,
    input.order,
    input.styles ? JSON.stringify(input.styles) : null,
    input.metadata ? JSON.stringify(input.metadata) : null,
    now
  );
  
  const content = db.prepare('SELECT * FROM page_contents WHERE id = ?').get(contentId);
  if (!content) throw new Error('Failed to create page content');
  return rowToPageContent(content);
}

export function updatePageContent(contentId: string, updates: Partial<PageContent>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.order !== undefined) {
    fields.push('order_num = ?');
    values.push(updates.order);
  }
  if (updates.styles !== undefined) {
    fields.push('styles = ?');
    values.push(JSON.stringify(updates.styles));
  }
  if (updates.metadata !== undefined) {
    fields.push('metadata = ?');
    values.push(JSON.stringify(updates.metadata));
  }
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(contentId);
  
  const stmt = db.prepare(`UPDATE page_contents SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deletePageContent(contentId: string): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM page_contents WHERE id = ?');
  stmt.run(contentId);
}

export function reorderPageContents(pageId: string, sectionId: string, contentIds: string[]): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE page_contents SET order_num = ?, updated_at = ? WHERE id = ? AND page_id = ? AND section_id = ?');
  
  contentIds.forEach((id, index) => {
    stmt.run(index, new Date().toISOString(), id, pageId, sectionId);
  });
}

export function getThemeSettings(): ThemeSettings {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM theme_settings WHERE id = 'default' LIMIT 1");
  const row = stmt.get();
  
  if (!row) {
    throw new Error('Theme settings not found');
  }
  
  return rowToThemeSettings(row);
}

export function updateThemeSettings(updates: Partial<ThemeSettings>): ThemeSettings {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  const fieldMap: Record<string, string> = {
    primaryColor: 'primary_color',
    secondaryColor: 'secondary_color',
    accentColor: 'accent_color',
    backgroundColor: 'background_color',
    textColor: 'text_color',
    headerBackgroundColor: 'header_background_color',
    headerTextColor: 'header_text_color',
    footerBackgroundColor: 'footer_background_color',
    footerTextColor: 'footer_text_color',
    buttonBackgroundColor: 'button_background_color',
    buttonTextColor: 'button_text_color',
    borderRadius: 'border_radius',
    fontSize: 'font_size',
    fontFamily: 'font_family',
    headerHeight: 'header_height',
    footerHeight: 'footer_height',
    customCSS: 'custom_css',
  };
  
  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (updates[key as keyof ThemeSettings] !== undefined) {
      fields.push(`${dbField} = ?`);
      values.push(updates[key as keyof ThemeSettings]);
    }
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    const stmt = db.prepare(`UPDATE theme_settings SET ${fields.join(', ')} WHERE id = 'default'`);
    stmt.run(...values);
  }
  
  return getThemeSettings();
}

export function getHeaderFooterContent(type: 'header' | 'footer'): HeaderFooterContent | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM header_footer_contents WHERE type = ? LIMIT 1');
  const row = stmt.get(type);
  return row ? rowToHeaderFooterContent(row) : undefined;
}

export function updateHeaderFooterContent(type: 'header' | 'footer', updates: Partial<HeaderFooterContent>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.logo !== undefined) {
    fields.push('logo = ?');
    values.push(updates.logo);
  }
  if (updates.links !== undefined) {
    fields.push('links = ?');
    values.push(JSON.stringify(updates.links));
  }
  if (updates.showSearch !== undefined) {
    fields.push('show_search = ?');
    values.push(updates.showSearch ? 1 : 0);
  }
  if (updates.showUserMenu !== undefined) {
    fields.push('show_user_menu = ?');
    values.push(updates.showUserMenu ? 1 : 0);
  }
  if (updates.customHTML !== undefined) {
    fields.push('custom_html = ?');
    values.push(updates.customHTML);
  }
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(type);
  
  const stmt = db.prepare(`UPDATE header_footer_contents SET ${fields.join(', ')} WHERE type = ?`);
  stmt.run(...values);
}

export function getAllHeaderFooterContents(): HeaderFooterContent[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM header_footer_contents');
  const rows = stmt.all();
  return rows.map(rowToHeaderFooterContent);
}

export function initializeDefaultContent() {
  const db = getDatabase();
  
  const existingPages = getAllPages();
  if (existingPages.length === 0) {
    createPage({
      slug: 'home',
      title: 'Home',
      isPublished: true,
      showInMenu: true,
      menuOrder: 1,
      showHeader: true,
      showFooter: true,
    });
    
    createPage({
      slug: 'about',
      title: 'About Social Stories',
      isPublished: true,
      showInMenu: true,
      menuOrder: 2,
      showHeader: true,
      showFooter: true,
    });
    
    createPage({
      slug: 'pricing',
      title: 'Pricing',
      isPublished: true,
      showInMenu: true,
      menuOrder: 3,
      showHeader: true,
      showFooter: true,
    });
    
    console.log('✅ Default pages created');
  }
  
  const existingHeader = getHeaderFooterContent('header');
  if (!existingHeader) {
    const stmt = db.prepare(`
      INSERT INTO header_footer_contents (id, type, content, links, show_search, show_user_menu, updated_at)
      VALUES (?, 'header', 'SocialStoryAI', ?, 0, 1, ?)
    `);
    
    const links = JSON.stringify([
      { label: 'Home', url: '/home' },
      { label: 'About', url: '/about' },
      { label: 'Pricing', url: '/pricing' },
      { label: 'FAQ', url: '/faq' },
      { label: 'Contact', url: '/contact' },
    ]);
    
    stmt.run('header', links, new Date().toISOString());
    console.log('✅ Default header created');
  }
  
  const existingFooter = getHeaderFooterContent('footer');
  if (!existingFooter) {
    const stmt = db.prepare(`
      INSERT INTO header_footer_contents (id, type, content, links, show_search, show_user_menu, updated_at)
      VALUES (?, 'footer', '© 2025 SocialStoryAI. All rights reserved.', ?, 0, 0, ?)
    `);
    
    const links = JSON.stringify([
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Contact Us', url: '/contact' },
    ]);
    
    stmt.run('footer', links, new Date().toISOString());
    console.log('✅ Default footer created');
  }
}
