import React, { useState } from 'react';
import { User, AuthError } from '@reelapps/auth';

interface AppWrapperProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: User | null;
  error: AuthError | null;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
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
          setLocalError('Password reset email sent!');
        }
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Sign Up' : 'Reset Password'}
            </h2>
            <p className="text-slate-400">
              {authMode === 'login' ? 'Welcome back to ReelApps' : authMode === 'signup' ? 'Create your ReelApps account' : 'Enter your email to reset password'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {authMode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            )}

            {(error || localError) && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error?.message || localError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Loading...' : authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Sign Up' : 'Send Reset Email'}
            </button>

            <div className="text-center space-y-2">
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
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppWrapper;