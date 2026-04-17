import React, { useState } from 'react';
import { register, signInWithGoogle } from '../services/authService.ts';
import Spinner from './Spinner.tsx';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailConfirmationMessage, setEmailConfirmationMessage] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password too short.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setEmailConfirmationMessage(false);
    setRateLimitMessage(false);
    setLoading(true);
    try {
      await register(email, password);
      onRegisterSuccess(); // Navigate to login page after successful registration
    } catch (err: any) {
      // Check if this is an email confirmation error
      if (err.message && err.message.includes('EMAIL_CONFIRMATION_REQUIRED')) {
        setEmailConfirmationMessage(true);
        setError('Account created! Please check your email to confirm your account before logging in.');
      } else if (err.message && err.message.includes('EMAIL_RATE_LIMIT')) {
        setRateLimitMessage(true);
        setError('Too many registration attempts. Please wait a few minutes or disable email confirmation.');
      } else {
      setError(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setEmailConfirmationMessage(false);
    setRateLimitMessage(false);
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
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white text-center mb-8">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {emailConfirmationMessage && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
            <p className="font-semibold mb-2">📧 Email Confirmation Required</p>
            <p className="text-sm mb-2">Please check your email inbox and click the confirmation link to activate your account.</p>
            <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
              <strong>For Development:</strong> To disable email confirmation, go to Supabase Dashboard → Authentication → Providers → Email → Turn OFF "Confirm email"
            </p>
          </div>
        )}
        {rateLimitMessage && (
          <div className="bg-orange-500/20 border border-orange-500/50 text-orange-700 dark:text-orange-300 p-4 rounded-lg">
            <p className="font-semibold mb-2">⏱️ Email Rate Limit Exceeded</p>
            <p className="text-sm mb-2">Too many registration emails have been sent. You have two options:</p>
            <ol className="text-xs mt-2 text-orange-600 dark:text-orange-400 list-decimal list-inside space-y-1">
              <li><strong>Wait 5-10 minutes</strong> and try again with the same email</li>
              <li><strong>Disable email confirmation</strong> in Supabase Dashboard → Authentication → Providers → Email → Turn OFF "Confirm email" (recommended for development)</li>
              <li>Try registering with a different email address</li>
            </ol>
          </div>
        )}
        {error && !emailConfirmationMessage && !rateLimitMessage && <p className="text-red-400 text-center bg-red-500/20 p-3 rounded-lg">{error}</p>}
        <div>
          <label htmlFor="email-reg" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email-reg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password-reg" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
            Password
          </label>
          <div className="relative">
          <input
              type={showPassword ? "text" : "password"}
            id="password-reg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300"
            placeholder="********"
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
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
            Confirm Password
          </label>
          <div className="relative">
          <input
              type={showConfirmPassword ? "text" : "password"}
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300"
            placeholder="********"
            required
            minLength={8}
          />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 focus:outline-none transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
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
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-6 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-500 transform hover:scale-105 transition-all duration-300 ease-in-out shimmer-button"
        >
          {loading ? <Spinner /> : 'Sign Up'}
        </button>
        <p className="text-center text-purple-700 dark:text-purple-200">
          Already have an account?{' '}
          <button type="button" onClick={onNavigateToLogin} className="font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white">
            Log in
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterScreen;