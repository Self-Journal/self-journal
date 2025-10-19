'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import AppNav from '@/components/AppNav';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, CalendarDays, CalendarRange, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Entry {
  id: number;
  date: string;
  type: string;
  title?: string;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
}

export default function IndexPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesResponse, collectionsResponse] = await Promise.all([
        fetch('/api/entries'),
        fetch('/api/collections'),
      ]);

      if (entriesResponse.status === 401 || collectionsResponse.status === 401) {
        router.push('/login');
        return;
      }

      const entriesData = await entriesResponse.json();
      const collectionsData = await collectionsResponse.json();

      setEntries(entriesData);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEntryDate = (entry: Entry) => {
    const date = parseISO(entry.date);
    switch (entry.type) {
      case 'daily':
        return format(date, 'EEEE, MMMM d, yyyy');
      case 'weekly':
        return `Week of ${format(date, 'MMM d, yyyy')}`;
      case 'monthly':
        return format(date, 'MMMM yyyy');
      default:
        return entry.date;
    }
  };

  const dailyEntries = entries.filter(e => e.type === 'daily').slice(0, 10);
  const weeklyEntries = entries.filter(e => e.type === 'weekly').slice(0, 5);
  const monthlyEntries = entries.filter(e => e.type === 'monthly').slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasContent = collections.length > 0 || entries.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />

      <main className="container max-w-4xl mx-auto py-8 px-4 flex-1">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Index</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!hasContent ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No entries or collections yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by creating a daily log or collection!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Collections */}
                {collections.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Collections</h2>
                    </div>
                    <div className="space-y-2">
                      {collections.map((collection) => (
                        <Link
                          key={collection.id}
                          href="/collections"
                          className="block p-3 rounded-md border hover:bg-muted/50 transition-colors"
                        >
                          <h3 className="font-medium">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {collection.description}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                    <Separator className="mt-6" />
                  </div>
                )}

                {/* Monthly Logs */}
                {monthlyEntries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarRange className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Monthly Logs</h2>
                    </div>
                    <div className="space-y-2">
                      {monthlyEntries.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/monthly?date=${entry.date}`}
                          className="block p-3 rounded-md border hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-sm">{formatEntryDate(entry)}</span>
                        </Link>
                      ))}
                    </div>
                    <Separator className="mt-6" />
                  </div>
                )}

                {/* Weekly Logs */}
                {weeklyEntries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Weekly Logs</h2>
                    </div>
                    <div className="space-y-2">
                      {weeklyEntries.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/weekly?date=${entry.date}`}
                          className="block p-3 rounded-md border hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-sm">{formatEntryDate(entry)}</span>
                        </Link>
                      ))}
                    </div>
                    <Separator className="mt-6" />
                  </div>
                )}

                {/* Daily Logs */}
                {dailyEntries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Recent Daily Logs</h2>
                    </div>
                    <div className="space-y-2">
                      {dailyEntries.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/daily?date=${entry.date}`}
                          className="block p-3 rounded-md border hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-sm">{formatEntryDate(entry)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
