export type TemplateType =
  | 'reading-list'
  | 'habit-tracker'
  | 'movies-watchlist'
  | 'travel-planning'
  | 'ideas'
  | 'workout-log';

export interface TemplateItem {
  content: string;
  symbol: 'bullet' | 'complete' | 'note' | 'event';
  metadata?: Record<string, string>;
}

export interface CollectionTemplate {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'lifestyle' | 'creative' | 'health';
  items: TemplateItem[];
  customFields?: string[];
}

export const collectionTemplates: CollectionTemplate[] = [
  {
    id: 'reading-list',
    name: 'Reading List',
    description: 'Track books you want to read and have read',
    icon: '📚',
    category: 'lifestyle',
    items: [
      { content: 'Currently Reading:', symbol: 'note' },
      { content: 'Add your current book here', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: 'Want to Read:', symbol: 'note' },
      { content: 'Add books to your reading list', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: 'Finished:', symbol: 'note' },
      { content: 'Books you\'ve completed', symbol: 'bullet' },
    ],
    customFields: ['Author', 'Rating', 'Date Finished']
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Monitor daily habits and build consistency',
    icon: '🎯',
    category: 'productivity',
    items: [
      { content: 'Habits to track this month:', symbol: 'note' },
      { content: 'Exercise 30 min', symbol: 'bullet' },
      { content: 'Read for 20 min', symbol: 'bullet' },
      { content: 'Drink 8 glasses of water', symbol: 'bullet' },
      { content: 'Meditate 10 min', symbol: 'bullet' },
      { content: 'Journal', symbol: 'bullet' },
    ]
  },
  {
    id: 'movies-watchlist',
    name: 'Movies & Series',
    description: 'Keep track of what to watch and what you\'ve seen',
    icon: '🎬',
    category: 'lifestyle',
    items: [
      { content: 'Watchlist:', symbol: 'note' },
      { content: 'Movies and series you want to watch', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: 'Currently Watching:', symbol: 'note' },
      { content: 'What you\'re watching right now', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: 'Completed:', symbol: 'note' },
      { content: 'Finished shows and movies', symbol: 'bullet' },
    ],
    customFields: ['Type (Movie/Series)', 'Rating', 'Date Watched']
  },
  {
    id: 'travel-planning',
    name: 'Travel Planning',
    description: 'Organize your trips and adventures',
    icon: '✈️',
    category: 'lifestyle',
    items: [
      { content: 'Destination:', symbol: 'note' },
      { content: 'Dates:', symbol: 'event' },
      { content: 'Packing List:', symbol: 'note' },
      { content: 'Places to Visit:', symbol: 'note' },
      { content: 'Restaurants to Try:', symbol: 'note' },
      { content: 'Budget:', symbol: 'note' },
    ]
  },
  {
    id: 'ideas',
    name: 'Ideas & Inspiration',
    description: 'Capture creative ideas and inspiration',
    icon: '💡',
    category: 'creative',
    items: [
      { content: 'Project Ideas:', symbol: 'note' },
      { content: 'New projects to start', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: 'Things to Learn:', symbol: 'note' },
      { content: 'Skills and topics to explore', symbol: 'bullet' },
      { content: '', symbol: 'bullet' },
      { content: 'Random Thoughts:', symbol: 'note' },
      { content: 'Interesting ideas and observations', symbol: 'bullet' },
    ]
  },
  {
    id: 'workout-log',
    name: 'Workout Log',
    description: 'Track your fitness journey',
    icon: '🏋️',
    category: 'health',
    items: [
      { content: 'This Week\'s Goals:', symbol: 'note' },
      { content: '', symbol: 'bullet' },
      { content: 'Workout Plan:', symbol: 'note' },
      { content: 'Monday - Upper Body', symbol: 'bullet' },
      { content: 'Wednesday - Lower Body', symbol: 'bullet' },
      { content: 'Friday - Cardio', symbol: 'bullet' },
      { content: 'Progress Notes:', symbol: 'note' },
    ],
    customFields: ['Sets', 'Reps', 'Weight']
  }
];

export function getTemplateById(id: TemplateType): CollectionTemplate | undefined {
  return collectionTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: CollectionTemplate['category']): CollectionTemplate[] {
  return collectionTemplates.filter(t => t.category === category);
}
