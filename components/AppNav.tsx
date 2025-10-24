'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calendar, CalendarDays, CalendarRange, List, LogOut, BarChart3, Menu, Sparkles } from 'lucide-react';

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/daily', label: 'Daily', icon: Calendar },
    { href: '/weekly', label: 'Weekly', icon: CalendarDays },
    { href: '/monthly', label: 'Monthly', icon: CalendarRange },
    { href: '/templates', label: 'Templates', icon: Sparkles },
    { href: '/index', label: 'Index', icon: List },
  ];

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
  };

  const closeSheet = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-3 lg:px-4">
        <div className="flex h-14 lg:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-foreground text-background transition-transform group-hover:scale-105">
              <span className="text-lg font-bold leading-none">•</span>
              <span className="text-lg font-bold leading-none">X</span>
              <span className="text-lg font-bold leading-none">→</span>
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              Self Journal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? 'default' : 'ghost'} size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <div className="ml-2 pl-2 border-l">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={closeSheet}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}

                <div className="my-4 border-t" />

                <Button
                  variant="ghost"
                  onClick={() => {
                    closeSheet();
                    handleSignOut();
                  }}
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
