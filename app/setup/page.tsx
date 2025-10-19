'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p>Checking setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Bullet Journal</h1>
            <p className="text-gray-600">Let&apos;s get your journal set up</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">What is a Bullet Journal?</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  A Bullet Journal is a customizable organization system that combines your to-do list,
                  planner, and diary in one place.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Daily, Weekly, and Monthly logs to track your tasks and events</li>
                    <li>Custom Collections for specific topics or projects</li>
                    <li>Rapid logging with symbols (•, X, &gt;, &lt;, −, ○)</li>
                    <li>Automatic index to find everything quickly</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">Understanding the Symbols</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl font-bold">•</span>
                  <div>
                    <strong>Task</strong> - A task that needs to be done
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl font-bold">X</span>
                  <div>
                    <strong>Complete</strong> - A task that&apos;s been completed
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl font-bold">&gt;</span>
                  <div>
                    <strong>Migrated</strong> - A task moved to another day/month
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl font-bold">&lt;</span>
                  <div>
                    <strong>Scheduled</strong> - A task scheduled for a specific date
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl font-bold">−</span>
                  <div>
                    <strong>Note</strong> - A general note or thought
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl font-bold">○</span>
                  <div>
                    <strong>Event</strong> - An event or appointment
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">Create Your Account</h2>
              <p className="text-center text-gray-600">
                Set up your admin account to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Complete Setup'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Self-hosted • Private • Yours forever</p>
        </div>
      </div>
    </div>
  );
}
