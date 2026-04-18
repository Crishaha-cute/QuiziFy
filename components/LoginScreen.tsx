import React, { useState, useEffect } from 'react';
import { login, signInWithGoogle } from '../services/authService.ts';
import { User } from '../types.ts';
import Spinner from './Spinner.tsx';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
  showRegistrationSuccess?: boolean;
  onDismissSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToRegister, showRegistrationSuccess = false, onDismissSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (showRegistrationSuccess && onDismissSuccess) {
      const timer = setTimeout(() => {
        onDismissSuccess();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showRegistrationSuccess, onDismissSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password too short.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Note: User will be redirected to Google, so we don't need to handle success here
      // The redirect will bring them back and onAuthStateChange will handle it
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto pt-20">
      <div className="flex justify-center mb-4 form-element-animation" style={{ animationDelay: '0.1s' }}>
        <div className="w-20 h-20 bg-purple-500/10 dark:bg-purple-500/30 rounded-full flex items-center justify-center border-2 border-purple-500 dark:border-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600 dark:text-purple-300" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
              <path d="M9 12.5a3.5 3.5 0 0 0 5.242 2.242m1.458 -2.242a3.5 3.5 0 0 0 -6.7 -2.242" />
            </svg>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white text-center mb-2 form-element-animation" style={{ animationDelay: '0.2s' }}>QuiziFy</h1>
      <p className="text-center text-purple-600 dark:text-purple-200 mb-8 form-element-animation" style={{ animationDelay: '0.3s' }}>Your partner in Learning!</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {showRegistrationSuccess && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Account created successfully! Please log in to continue.</span>
            </div>
            {onDismissSuccess && (
              <button
                type="button"
                onClick={onDismissSuccess}
                className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 ml-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        )}
        {error && <p className="text-red-400 text-center bg-red-500/20 p-3 rounded-lg">{error}</p>}
        <div className="form-element-animation" style={{ animationDelay: '0.4s' }}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300"
            
            required
          />
        </div>
        <div className="form-element-animation" style={{ animationDelay: '0.5s' }}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
            Password
          </label>
          <div className="relative">
          <input
              type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300"
            placeholder=""
            required
            minLength={8}
          />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center py-3 px-6 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-500 transform hover:scale-105 transition-all duration-300 ease-in-out shimmer-button form-element-animation"
          style={{ animationDelay: '0.6s' }}
        >
          {loading ? <Spinner /> : 'Log In'}
        </button>
        
        <div className="form-element-animation" style={{ animationDelay: '0.65s' }}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 ease-in-out form-element-animation"
          style={{ animationDelay: '0.7s' }}
        >
          {googleLoading ? (
            <Spinner />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p className="text-center text-purple-700 dark:text-purple-200 form-element-animation" style={{ animationDelay: '0.8s' }}>
          Don't have an account?{' '}
          <button type="button" onClick={onNavigateToRegister} className="font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white">
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginScreen;