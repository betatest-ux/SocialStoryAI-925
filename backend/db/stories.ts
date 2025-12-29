type Story = {
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

const stories: Story[] = [];

export function createStory(input: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Story {
  const story: Story = {
    ...input,
    id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  stories.push(story);
  return story;
}

export function getStory(id: string): Story | undefined {
  return stories.find(s => s.id === id);
}

export function getUserStories(userId: string): Story[] {
  return stories.filter(s => s.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateStory(id: string, updates: Partial<Story>): void {
  const index = stories.findIndex(s => s.id === id);
  if (index !== -1) {
    stories[index] = { 
      ...stories[index], 
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function deleteStory(id: string): void {
  const index = stories.findIndex(s => s.id === id);
  if (index !== -1) {
    stories.splice(index, 1);
  }
}

export function getAllStories(): Story[] {
  return stories.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
