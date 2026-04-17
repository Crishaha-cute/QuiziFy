import React, { useState } from 'react';
import { register } from '../services/authService.js';
import Spinner from './Spinner.js';

const RegisterScreen = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
    setLoading(true);
    try {
      const user = await register(email, password);
      onRegisterSuccess(user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'w-full max-w-sm mx-auto pt-20' },
    React.createElement('h1', { className: 'text-4xl md:text-5xl font-bold text-gray-800 dark:text-white text-center mb-8' }, 'Create Account'),
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'space-y-6' },
      error && React.createElement('p', { className: 'text-red-400 text-center bg-red-500/20 p-3 rounded-lg' }, error),
      React.createElement(
        'div',
        null,
        React.createElement('label', { htmlFor: 'email-reg', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Email Address'),
        React.createElement('input', {
          type: 'email',
          id: 'email-reg',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: 'w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300',
          placeholder: 'you@example.com',
          required: true
        })
      ),
      React.createElement(
        'div',
        null,
        React.createElement('label', { htmlFor: 'password-reg', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Password'),
        React.createElement('input', {
          type: 'password',
          id: 'password-reg',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          className: 'w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300',
          placeholder: '********',
          required: true,
          minLength: 8
        })
      ),
      React.createElement(
        'div',
        null,
        React.createElement('label', { htmlFor: 'confirm-password', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Confirm Password'),
        React.createElement('input', {
          type: 'password',
          id: 'confirm-password',
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          className: 'w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300',
          placeholder: '********',
          required: true,
          minLength: 8
        })
      ),
      React.createElement(
        'button',
        {
          type: 'submit',
          disabled: loading,
          className: 'w-full flex items-center justify-center py-3 px-6 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-500 transform hover:scale-105 transition-all duration-300 ease-in-out shimmer-button'
        },
        loading ? React.createElement(Spinner, null) : 'Sign Up'
      ),
      React.createElement(
        'p',
        { className: 'text-center text-purple-700 dark:text-purple-200' },
        'Already have an account? ',
        React.createElement('button', { type: 'button', onClick: onNavigateToLogin, className: 'font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white' }, 'Log in')
      )
    )
  );
};

export default RegisterScreen;