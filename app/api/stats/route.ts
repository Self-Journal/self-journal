import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Total de tasks por símbolo
    const tasksBySymbol = await prisma.$queryRaw<{ symbol: string; count: bigint }[]>`
      SELECT
        t.symbol,
        COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ${userId}
      GROUP BY t.symbol
    `;

    // Total de tasks
    const totalTasksResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ${userId}
    `;
    const totalTasks = totalTasksResult[0];

    // Tasks completadas
    const completedTasksResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ${userId} AND t.symbol = 'complete'
    `;
    const completedTasks = completedTasksResult[0];

    // Tasks migradas
    const migratedTasksResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN entries e ON t.entry_id = e.id
      WHERE e.user_id = ${userId} AND t.symbol = 'migrated'
    `;
    const migratedTasks = migratedTasksResult[0];

    // Total de entries por tipo
    const entriesByType = await prisma.$queryRaw<{ type: string; count: bigint }[]>`
      SELECT
        type,
        COUNT(*) as count
      FROM entries
      WHERE user_id = ${userId}
      GROUP BY type
    `;

    // Total de collections
    const totalCollectionsResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM collections
      WHERE user_id = ${userId}
    `;
    const totalCollections = totalCollectionsResult[0];

    // Atividade dos últimos 30 dias
    const recentActivity = await prisma.$queryRaw<{ date: string; entries: bigint; tasks: bigint }[]>`
      SELECT
        DATE(e.created_at) as date,
        COUNT(DISTINCT e.id) as entries,
        COUNT(t.id) as tasks
      FROM entries e
      LEFT JOIN tasks t ON t.entry_id = e.id
      WHERE e.user_id = ${userId}
        AND e.created_at >= datetime('now', '-30 days')
      GROUP BY DATE(e.created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Taxa de conclusão (completion rate)
    const totalCount = Number(totalTasks.count);
    const completedCount = Number(completedTasks.count);
    const completionRate = totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

    // Streak (dias consecutivos com entradas)
    const streakData = await prisma.$queryRaw<{ date: string }[]>`
      SELECT DISTINCT DATE(created_at) as date
      FROM entries
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT 365
    `;

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
    const moodData = await prisma.$queryRaw<{ date: string; mood: string }[]>`
      SELECT
        date,
        mood
      FROM moods
      WHERE user_id = ${userId}
        AND date >= date('now', '-30 days')
      ORDER BY date DESC
    `;

    // Mood distribution
    const moodDistribution = await prisma.$queryRaw<{ mood: string; count: bigint }[]>`
      SELECT
        mood,
        COUNT(*) as count
      FROM moods
      WHERE user_id = ${userId}
      GROUP BY mood
    `;

    // Produtividade ao longo do tempo (tarefas completadas por dia nos últimos 30 dias)
    const productivityTimeline = await prisma.$queryRaw<{ date: string; completed: bigint; total: bigint }[]>`
      SELECT
        e.date,
        COUNT(CASE WHEN t.symbol = 'complete' THEN 1 END) as completed,
        COUNT(t.id) as total
      FROM entries e
      LEFT JOIN tasks t ON t.entry_id = e.id
      WHERE e.user_id = ${userId}
        AND e.type = 'daily'
        AND e.date >= date('now', '-30 days')
      GROUP BY e.date
      ORDER BY e.date ASC
    `;

    return NextResponse.json({
      overview: {
        totalTasks: Number(totalTasks.count),
        completedTasks: Number(completedTasks.count),
        migratedTasks: Number(migratedTasks.count),
        completionRate,
        totalCollections: Number(totalCollections.count),
      },
      tasksBySymbol: tasksBySymbol.reduce((acc, curr) => {
        acc[curr.symbol] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>),
      entriesByType: entriesByType.reduce((acc, curr) => {
        acc[curr.type] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>),
      recentActivity: recentActivity.map(r => ({
        date: r.date,
        entries: Number(r.entries),
        tasks: Number(r.tasks),
      })),
      streaks: {
        current: currentStreak,
        longest: longestStreak,
      },
      moods: moodData,
      moodDistribution: moodDistribution.reduce((acc, curr) => {
        acc[curr.mood] = Number(curr.count);
        return acc;
      }, {} as Record<string, number>),
      productivityTimeline: productivityTimeline.map(p => ({
        date: p.date,
        completed: Number(p.completed),
        total: Number(p.total),
      })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
