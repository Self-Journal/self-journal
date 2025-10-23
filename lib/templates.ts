// Pre-defined challenge templates for users to add to their journal

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  category: 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'habits' | 'learning';
  icon: string;
  tasks: {
    content: string;
    recurrence: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly tasks
    dayOfMonth?: number; // 1-31 for monthly tasks
  }[];
}

export const challengeTemplates: ChallengeTemplate[] = [
  {
    id: '30-day-fitness',
    name: '30 Day Fitness Challenge',
    description: 'Build a consistent exercise habit with daily workouts',
    duration: 30,
    category: 'fitness',
    icon: '=�',
    tasks: [
      { content: '30 minutes of exercise', recurrence: 'daily' },
      { content: '10,000 steps', recurrence: 'daily' },
      { content: 'Stretch for 10 minutes', recurrence: 'daily' },
      { content: 'Track weight and measurements', recurrence: 'weekly', dayOfWeek: 1 },
    ],
  },
  {
    id: '40-days-no-sugar',
    name: '40 Days No Sugar',
    description: 'Eliminate refined sugar from your diet for 40 days',
    duration: 40,
    category: 'health',
    icon: '<N',
    tasks: [
      { content: 'No refined sugar today', recurrence: 'daily' },
      { content: 'Meal prep healthy snacks', recurrence: 'weekly', dayOfWeek: 0 },
      { content: 'Journal sugar cravings and triggers', recurrence: 'daily' },
    ],
  },
  {
    id: '21-day-meditation',
    name: '21 Day Meditation Challenge',
    description: 'Develop a daily meditation practice',
    duration: 21,
    category: 'mindfulness',
    icon: '>�',
    tasks: [
      { content: '10 minutes morning meditation', recurrence: 'daily' },
      { content: '5 minutes evening reflection', recurrence: 'daily' },
      { content: 'Gratitude journal (3 things)', recurrence: 'daily' },
    ],
  },
  {
    id: '100-days-coding',
    name: '100 Days of Code',
    description: 'Code for at least 1 hour every day',
    duration: 100,
    category: 'learning',
    icon: '=�',
    tasks: [
      { content: 'Code for 1 hour', recurrence: 'daily' },
      { content: 'Tweet progress #100DaysOfCode', recurrence: 'daily' },
      { content: 'Review weekly progress', recurrence: 'weekly', dayOfWeek: 0 },
    ],
  },
  {
    id: '30-day-reading',
    name: '30 Day Reading Challenge',
    description: 'Read for at least 30 minutes every day',
    duration: 30,
    category: 'learning',
    icon: '=�',
    tasks: [
      { content: 'Read for 30 minutes', recurrence: 'daily' },
      { content: 'Write book notes/summary', recurrence: 'weekly', dayOfWeek: 0 },
    ],
  },
  {
    id: '66-day-habit',
    name: '66 Day Habit Builder',
    description: 'Research shows it takes 66 days to form a new habit',
    duration: 66,
    category: 'habits',
    icon: '<�',
    tasks: [
      { content: 'Do your habit', recurrence: 'daily' },
      { content: 'Reflect on progress and challenges', recurrence: 'weekly', dayOfWeek: 0 },
    ],
  },
  {
    id: '30-day-water',
    name: '30 Day Hydration Challenge',
    description: 'Drink 8 glasses of water daily',
    duration: 30,
    category: 'health',
    icon: '=�',
    tasks: [
      { content: 'Drink 8 glasses of water', recurrence: 'daily' },
      { content: 'Track water intake', recurrence: 'daily' },
    ],
  },
  {
    id: '30-day-writing',
    name: '30 Day Writing Challenge',
    description: 'Write at least 500 words every day',
    duration: 30,
    category: 'productivity',
    icon: '',
    tasks: [
      { content: 'Write 500 words', recurrence: 'daily' },
      { content: 'Morning pages (3 pages)', recurrence: 'daily' },
    ],
  },
  {
    id: '7-day-sleep',
    name: '7 Day Sleep Reset',
    description: 'Improve sleep quality with consistent habits',
    duration: 7,
    category: 'health',
    icon: '=4',
    tasks: [
      { content: 'No screens 1hr before bed', recurrence: 'daily' },
      { content: 'In bed by 10:30 PM', recurrence: 'daily' },
      { content: 'Wake up at 6:30 AM', recurrence: 'daily' },
      { content: 'Track sleep quality', recurrence: 'daily' },
    ],
  },
  {
    id: '14-day-gratitude',
    name: '14 Day Gratitude Practice',
    description: 'Cultivate gratitude and positive mindset',
    duration: 14,
    category: 'mindfulness',
    icon: '=O',
    tasks: [
      { content: 'List 3 things I am grateful for', recurrence: 'daily' },
      { content: 'Send thank you message to someone', recurrence: 'daily' },
      { content: 'Evening gratitude reflection', recurrence: 'daily' },
    ],
  },
];

export function getChallengesByCategory(category: ChallengeTemplate['category']) {
  return challengeTemplates.filter((template) => template.category === category);
}

export function getChallengeById(id: string) {
  return challengeTemplates.find((template) => template.id === id);
}

export const categories = [
  { id: 'all', name: 'All', icon: '(' },
  { id: 'fitness', name: 'Fitness', icon: '=�' },
  { id: 'health', name: 'Health', icon: '<N' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '>�' },
  { id: 'learning', name: 'Learning', icon: '=�' },
  { id: 'productivity', name: 'Productivity', icon: '' },
  { id: 'habits', name: 'Habits', icon: '<�' },
] as const;
