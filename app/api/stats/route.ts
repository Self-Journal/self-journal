import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Total de tasks por símbolo
    const tasksBySymbol = db.prepare(`
      SELECT
        t.symbol,
        COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ?
      GROUP BY t.symbol
    `).all(userId) as { symbol: string; count: number }[];

    // Total de tasks
    const totalTasks = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ?
    `).get(userId) as { count: number };

    // Tasks completadas
    const completedTasks = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ? AND t.symbol = 'complete'
    `).get(userId) as { count: number };

    // Tasks migradas
    const migratedTasks = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ? AND t.symbol = 'migrated'
    `).get(userId) as { count: number };

    // Total de entries por tipo
    const entriesByType = db.prepare(`
      SELECT
        type,
        COUNT(*) as count
      FROM entries
      WHERE user_id = ?
      GROUP BY type
    `).all(userId) as { type: string; count: number }[];

    // Total de collections
    const totalCollections = db.prepare(`
      SELECT COUNT(*) as count
      FROM collections
      WHERE user_id = ?
    `).get(userId) as { count: number };

    // Atividade dos últimos 30 dias
    const recentActivity = db.prepare(`
      SELECT
        DATE(e.created_at) as date,
        COUNT(DISTINCT e.id) as entries,
        COUNT(t.id) as tasks
      FROM entries e
      LEFT JOIN tasks t ON t.entry_id = e.id
      WHERE e.user_id = ?
        AND e.created_at >= datetime('now', '-30 days')
      GROUP BY DATE(e.created_at)
      ORDER BY date DESC
      LIMIT 30
    `).all(userId) as { date: string; entries: number; tasks: number }[];

    // Taxa de conclusão (completion rate)
    const completionRate = totalTasks.count > 0
      ? Math.round((completedTasks.count / totalTasks.count) * 100)
      : 0;

    // Streak (dias consecutivos com entradas)
    const streakData = db.prepare(`
      SELECT DISTINCT DATE(created_at) as date
      FROM entries
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 365
    `).all(userId) as { date: string }[];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < streakData.length; i++) {
      const currentDate = streakData[i].date;
      const prevDate = i > 0 ? streakData[i - 1].date : null;

      if (i === 0) {
        tempStreak = 1;
        if (currentDate === today ||
            new Date(currentDate).getTime() === new Date(today).getTime() - 86400000) {
          currentStreak = 1;
        }
      } else if (prevDate) {
        const daysDiff = (new Date(prevDate).getTime() - new Date(currentDate).getTime()) / 86400000;
        if (daysDiff === 1) {
          tempStreak++;
          if (i === 1 || currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Mood data dos últimos 30 dias
    const moodData = db.prepare(`
      SELECT
        date,
        mood
      FROM moods
      WHERE user_id = ?
        AND date >= date('now', '-30 days')
      ORDER BY date DESC
    `).all(userId) as { date: string; mood: string }[];

    // Mood distribution
    const moodDistribution = db.prepare(`
      SELECT
        mood,
        COUNT(*) as count
      FROM moods
      WHERE user_id = ?
      GROUP BY mood
    `).all(userId) as { mood: string; count: number }[];

    // Produtividade ao longo do tempo (tarefas completadas por dia nos últimos 30 dias)
    const productivityTimeline = db.prepare(`
      SELECT
        e.date,
        COUNT(CASE WHEN t.symbol = 'complete' THEN 1 END) as completed,
        COUNT(t.id) as total
      FROM entries e
      LEFT JOIN tasks t ON t.entry_id = e.id
      WHERE e.user_id = ?
        AND e.type = 'daily'
        AND e.date >= date('now', '-30 days')
      GROUP BY e.date
      ORDER BY e.date ASC
    `).all(userId) as { date: string; completed: number; total: number }[];

    return NextResponse.json({
      overview: {
        totalTasks: totalTasks.count,
        completedTasks: completedTasks.count,
        migratedTasks: migratedTasks.count,
        completionRate,
        totalCollections: totalCollections.count,
      },
      tasksBySymbol: tasksBySymbol.reduce((acc, curr) => {
        acc[curr.symbol] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      entriesByType: entriesByType.reduce((acc, curr) => {
        acc[curr.type] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      recentActivity,
      streaks: {
        current: currentStreak,
        longest: longestStreak,
      },
      moods: moodData,
      moodDistribution: moodDistribution.reduce((acc, curr) => {
        acc[curr.mood] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      productivityTimeline,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
