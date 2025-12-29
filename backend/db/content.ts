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

const pages: Page[] = [
  {
    id: 'home',
    slug: 'home',
    title: 'Home',
    isPublished: true,
    showInMenu: true,
    menuOrder: 1,
    showHeader: true,
    showFooter: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'about',
    slug: 'about',
    title: 'About Social Stories',
    isPublished: true,
    showInMenu: true,
    menuOrder: 2,
    showHeader: true,
    showFooter: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pricing',
    slug: 'pricing',
    title: 'Pricing',
    isPublished: true,
    showInMenu: true,
    menuOrder: 3,
    showHeader: true,
    showFooter: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const pageContents: PageContent[] = [
  {
    id: 'home-hero-heading',
    pageId: 'home',
    sectionId: 'hero',
    type: 'heading',
    content: 'Create Personalized Social Stories with AI',
    order: 1,
    styles: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'home-hero-subtitle',
    pageId: 'home',
    sectionId: 'hero',
    type: 'text',
    content: 'Supporting individuals with autism through personalized social stories',
    order: 2,
    styles: { fontSize: 18, textAlign: 'center' },
    updatedAt: new Date().toISOString(),
  },
];

const themeSettings: ThemeSettings = {
  id: 'default',
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  headerBackgroundColor: '#FFFFFF',
  headerTextColor: '#1F2937',
  footerBackgroundColor: '#F9FAFB',
  footerTextColor: '#6B7280',
  buttonBackgroundColor: '#6366F1',
  buttonTextColor: '#FFFFFF',
  borderRadius: 12,
  fontSize: 16,
  fontFamily: 'System',
  headerHeight: 60,
  footerHeight: 80,
  updatedAt: new Date().toISOString(),
};

const headerFooterContents: HeaderFooterContent[] = [
  {
    id: 'header',
    type: 'header',
    content: 'SocialStoryAI',
    logo: '',
    links: [
      { label: 'Home', url: '/home' },
      { label: 'About', url: '/about' },
      { label: 'Pricing', url: '/pricing' },
      { label: 'FAQ', url: '/faq' },
      { label: 'Contact', url: '/contact' },
    ],
    showSearch: false,
    showUserMenu: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'footer',
    type: 'footer',
    content: '© 2025 SocialStoryAI. All rights reserved.',
    links: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Contact Us', url: '/contact' },
    ],
    showSearch: false,
    showUserMenu: false,
    updatedAt: new Date().toISOString(),
  },
];

export function getAllPages(): Page[] {
  return pages;
}

export function getPage(slugOrId: string): Page | undefined {
  return pages.find(p => p.slug === slugOrId || p.id === slugOrId);
}

export function createPage(input: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Page {
  const page: Page = {
    ...input,
    id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  pages.push(page);
  return page;
}

export function updatePage(pageId: string, updates: Partial<Page>): void {
  const index = pages.findIndex(p => p.id === pageId);
  if (index !== -1) {
    pages[index] = { ...pages[index], ...updates, updatedAt: new Date().toISOString() };
  }
}

export function deletePage(pageId: string): void {
  const index = pages.findIndex(p => p.id === pageId);
  if (index !== -1) {
    pages.splice(index, 1);
    const contentIndices = pageContents.map((c, i) => c.pageId === pageId ? i : -1).filter(i => i !== -1);
    contentIndices.reverse().forEach(i => pageContents.splice(i, 1));
  }
}

export function getPageContents(pageId: string): PageContent[] {
  return pageContents.filter(c => c.pageId === pageId).sort((a, b) => a.order - b.order);
}

export function getPageContentsBySection(pageId: string, sectionId: string): PageContent[] {
  return pageContents
    .filter(c => c.pageId === pageId && c.sectionId === sectionId)
    .sort((a, b) => a.order - b.order);
}

export function createPageContent(input: Omit<PageContent, 'id' | 'updatedAt'>): PageContent {
  const content: PageContent = {
    ...input,
    id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    updatedAt: new Date().toISOString(),
  };
  pageContents.push(content);
  return content;
}

export function updatePageContent(contentId: string, updates: Partial<PageContent>): void {
  const index = pageContents.findIndex(c => c.id === contentId);
  if (index !== -1) {
    pageContents[index] = { ...pageContents[index], ...updates, updatedAt: new Date().toISOString() };
  }
}

export function deletePageContent(contentId: string): void {
  const index = pageContents.findIndex(c => c.id === contentId);
  if (index !== -1) {
    pageContents.splice(index, 1);
  }
}

export function reorderPageContents(pageId: string, sectionId: string, contentIds: string[]): void {
  contentIds.forEach((id, index) => {
    const content = pageContents.find(c => c.id === id);
    if (content && content.pageId === pageId && content.sectionId === sectionId) {
      updatePageContent(id, { order: index });
    }
  });
}

export function getThemeSettings(): ThemeSettings {
  return themeSettings;
}

export function updateThemeSettings(updates: Partial<ThemeSettings>): ThemeSettings {
  Object.assign(themeSettings, { ...updates, updatedAt: new Date().toISOString() });
  return themeSettings;
}

export function getHeaderFooterContent(type: 'header' | 'footer'): HeaderFooterContent | undefined {
  return headerFooterContents.find(h => h.type === type);
}

export function updateHeaderFooterContent(type: 'header' | 'footer', updates: Partial<HeaderFooterContent>): void {
  const index = headerFooterContents.findIndex(h => h.type === type);
  if (index !== -1) {
    headerFooterContents[index] = { 
      ...headerFooterContents[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
  }
}

export function getAllHeaderFooterContents(): HeaderFooterContent[] {
  return headerFooterContents;
}
