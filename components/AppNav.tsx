'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, CalendarRange, BookOpen, List, LogOut, BarChart3 } from 'lucide-react';

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/daily', label: 'Daily', icon: Calendar },
    { href: '/weekly', label: 'Weekly', icon: CalendarDays },
    { href: '/monthly', label: 'Monthly', icon: CalendarRange },
    { href: '/collections', label: 'Collections', icon: BookOpen },
    { href: '/index', label: 'Index', icon: List },
  ];

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground text-background transition-transform group-hover:scale-105">
              <span className="text-xl font-bold leading-none">•</span>
              <span className="text-xl font-bold leading-none">X</span>
              <span className="text-xl font-bold leading-none">→</span>
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              Self Journal
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <div className="ml-2 pl-2 border-l">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
