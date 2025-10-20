/**
 * Script to seed demo user and sample data
 * Run with: npx ts-node scripts/seed-demo.ts
 */

import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

async function seedDemo() {
  console.log('🌱 Seeding demo user and data...');

  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'demo' }
    });

    let demoUser;

    if (existingUser) {
      console.log('✓ Demo user already exists');
      demoUser = existingUser;
    } else {
      // Create demo user
      const passwordHash = bcrypt.hashSync('demo123', 10);
      demoUser = await prisma.user.create({
        data: {
          username: 'demo',
          passwordHash,
        }
      });
      console.log('✓ Demo user created (username: demo, password: demo123)');
    }

    // Check if demo user already has entries
    const entryCount = await prisma.entry.count({
      where: { userId: demoUser.id }
    });

    if (entryCount > 0) {
      console.log(`✓ Demo user already has ${entryCount} entries`);
      console.log('✅ Demo environment ready!');
      return;
    }

    // Create sample entries for the last 7 days
    const today = new Date();
    const sampleEntries = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Daily entry with sample tasks
      sampleEntries.push({
        userId: demoUser.id,
        date: dateStr,
        type: 'daily',
        title: null,
      });
    }

    await prisma.entry.createMany({
      data: sampleEntries
    });

    console.log(`✓ Created ${sampleEntries.length} sample daily entries`);

    // Create sample tasks for today
    const todayStr = today.toISOString().split('T')[0];
    const todayEntry = await prisma.entry.findFirst({
      where: {
        userId: demoUser.id,
        date: todayStr,
        type: 'daily'
      }
    });

    if (todayEntry) {
      const sampleTasks = [
        { content: 'Review pull requests', symbol: 'complete', position: 0 },
        { content: 'Update project documentation', symbol: 'bullet', position: 1 },
        { content: 'Team standup meeting', symbol: 'complete', position: 2 },
        { content: 'Work on new feature', symbol: 'bullet', position: 3 },
        { content: 'Code review session', symbol: 'bullet', position: 4 },
        { content: 'Plan sprint for next week', symbol: 'scheduled', position: 5 },
        { content: 'Coffee chat with design team', symbol: 'event', position: 6 },
        { content: 'Research new framework options', symbol: 'note', position: 7 },
      ];

      await prisma.task.createMany({
        data: sampleTasks.map(task => ({
          ...task,
          entryId: todayEntry.id,
        }))
      });

      console.log(`✓ Created ${sampleTasks.length} sample tasks for today`);
    }

    // Create sample collections
    const collections = [
      { name: 'Work Projects', description: 'Professional tasks and goals' },
      { name: 'Personal Goals', description: 'Personal development and habits' },
      { name: 'Reading List', description: 'Books and articles to read' },
    ];

    for (const collection of collections) {
      await prisma.collection.create({
        data: {
          ...collection,
          userId: demoUser.id,
        }
      });
    }

    console.log(`✓ Created ${collections.length} sample collections`);

    // Create mood entries for the last 7 days
    const moodValues = ['good', 'amazing', 'okay', 'good', 'amazing', 'good', 'amazing'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      await prisma.mood.create({
        data: {
          userId: demoUser.id,
          date: dateStr,
          mood: moodValues[i],
          note: i === 0 ? 'Feeling productive today!' : null,
        }
      });
    }

    console.log('✓ Created sample mood entries');

    console.log('\n✅ Demo environment ready!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Username: demo');
    console.log('   Password: demo123');
    console.log('\n💡 Set DEMO_MODE=true in .env to enable auto-login');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDemo()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
