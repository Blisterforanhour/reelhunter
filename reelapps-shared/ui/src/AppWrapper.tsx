import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import Button from './Button';
import Card from './Card';

export interface AppWrapperProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: User | null;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  isLoading: boolean;
}

const AppWrapper: React.FC<AppWrapperProps> = ({
  children,
  isAuthenticated,
  isInitializing,
  user,
  error,
  onLogin,
  onSignup,
  onPasswordReset,
  isLoading
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      try {
        if (authMode === 'login') {
          await onLogin(email, password);
        } else if (authMode === 'signup') {
          await onSignup(email, password);
        } else if (authMode === 'reset') {
          await onPasswordReset(email);
          setAuthMode('login');
          setLocalError('Password reset email sent. Check your inbox.');
        }
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ReelApps</h1>
            <p className="text-slate-400">
              {authMode === 'login' && 'Sign in to your account'}
              {authMode === 'signup' && 'Create your account'}
              {authMode === 'reset' && 'Reset your password'}
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {authMode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : (
                authMode === 'login' ? 'Sign In' :
                authMode === 'signup' ? 'Sign Up' :
                'Send Reset Email'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {authMode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Don't have an account? Sign up
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setAuthMode('reset')}
                  className="text-slate-400 hover:text-slate-300 text-sm"
                >
                  Forgot password?
                </button>
              </>
            )}
            {authMode === 'signup' && (
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Already have an account? Sign in
              </button>
            )}
            {authMode === 'reset' && (
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Back to sign in
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppWrapper;