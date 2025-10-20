'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/Logo';
import {
  Circle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Minus,
  CalendarDays,
  Sparkles,
  Lock,
  User,
  BookOpen
} from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    checkSetupNeeded();
  }, []);

  const checkSetupNeeded = async () => {
    try {
      const response = await fetch('/api/setup');
      const data = await response.json();

      if (!data.needsSetup) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking setup:', error);
    } finally {
      setCheckingSetup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
      } else {
        // Auto login after registration
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Account created but login failed. Please try logging in.');
          setLoading(false);
        } else {
          router.push('/daily');
          router.refresh();
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Checking setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold">Self Journal</h1>
          </div>
          <p className="text-muted-foreground">Your personal productivity companion</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      step >= num
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-muted'
                    }`}>
                      {num}
                    </div>
                    {num < 3 && (
                      <div className={`w-12 h-0.5 transition-colors ${
                        step > num ? 'bg-foreground' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <CardTitle>
              {step === 1 && 'Welcome to Self Journal'}
              {step === 2 && 'Understanding the Symbols'}
              {step === 3 && 'Create Your Account'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'A modern approach to productivity and mindfulness'}
              {step === 2 && 'Learn the rapid logging system'}
              {step === 3 && 'Set up your personal journal'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Introduction */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-foreground">
                    Self Journal is a customizable organization system that combines your to-do list,
                    planner, and diary in one private, self-hosted application.
                  </p>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Key Features
                    </h3>
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <CalendarDays className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Daily, Weekly, Monthly Logs</p>
                          <p className="text-sm text-muted-foreground">Track tasks and events across different time scales</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <BookOpen className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Custom Collections</p>
                          <p className="text-sm text-muted-foreground">Organize specific topics or projects</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Rapid Logging</p>
                          <p className="text-sm text-muted-foreground">Quick entry using intuitive symbols</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Symbols */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid gap-3">
                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <span className="text-2xl font-mono">•</span>
                    <div className="flex-1">
                      <p className="font-medium">Task</p>
                      <p className="text-sm text-muted-foreground">A task that needs to be done</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <CheckCircle2 className="h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-medium">Complete</p>
                      <p className="text-sm text-muted-foreground">A completed task</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <span className="text-2xl font-mono">&gt;</span>
                    <div className="flex-1">
                      <p className="font-medium">Migrated</p>
                      <p className="text-sm text-muted-foreground">Task moved to another day</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <span className="text-2xl font-mono">&lt;</span>
                    <div className="flex-1">
                      <p className="font-medium">Scheduled</p>
                      <p className="text-sm text-muted-foreground">Scheduled for a specific date</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <Minus className="h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-medium">Note</p>
                      <p className="text-sm text-muted-foreground">A general note or thought</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <Circle className="h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-medium">Event</p>
                      <p className="text-sm text-muted-foreground">An event or appointment</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Account Creation */}
            {step === 3 && (
              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/15 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="h-11"
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Creating...' : 'Complete Setup'}
                      {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Self-hosted • Private • Yours forever</p>
        </div>
      </div>
    </div>
  );
}
