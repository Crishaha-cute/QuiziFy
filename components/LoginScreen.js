import React, { useState } from 'react';
import { login } from '../services/authService.js';
import Spinner from './Spinner.js';

const LoginScreen = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'w-full max-w-sm mx-auto pt-20' },
    React.createElement(
      'div',
      { className: 'flex justify-center mb-4 form-element-animation', style: { animationDelay: '0.1s' } },
      React.createElement(
        'div',
        { className: 'w-20 h-20 bg-purple-500/10 dark:bg-purple-500/30 rounded-full flex items-center justify-center border-2 border-purple-500 dark:border-purple-400' },
        React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', className: 'h-10 w-10 text-purple-600 dark:text-purple-300', viewBox: '0 0 24 24', strokeWidth: '1.5', stroke: 'currentColor', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
          React.createElement('path', { d: 'M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z' }),
          React.createElement('path', { d: 'M9 12.5a3.5 3.5 0 0 0 5.242 2.242m1.458 -2.242a3.5 3.5 0 0 0 -6.7 -2.242' })
        )
      )
    ),
    React.createElement('h1', { className: 'text-4xl md:text-5xl font-bold text-gray-800 dark:text-white text-center mb-2 form-element-animation', style: { animationDelay: '0.2s' } }, 'QuiziFy'),
    React.createElement('p', { className: 'text-center text-purple-600 dark:text-purple-200 mb-8 form-element-animation', style: { animationDelay: '0.3s' } }, 'Your partner in Learning!'),
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'space-y-6' },
      error && React.createElement('p', { className: 'text-red-400 text-center bg-red-500/20 p-3 rounded-lg' }, error),
      React.createElement(
        'div',
        { className: 'form-element-animation', style: { animationDelay: '0.4s' } },
        React.createElement('label', { htmlFor: 'email', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Email Address'),
        React.createElement('input', {
          type: 'email',
          id: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: 'w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300',
          placeholder: 'cris@example.com',
          required: true
        })
      ),
      React.createElement(
        'div',
        { className: 'form-element-animation', style: { animationDelay: '0.5s' } },
        React.createElement('label', { htmlFor: 'password', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Password'),
        React.createElement('input', {
          type: 'password',
          id: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          className: 'w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300',
          placeholder: '',
          required: true,
          minLength: 8
        })
      ),
      React.createElement(
        'button',
        {
          type: 'submit',
          disabled: loading,
          className: 'w-full flex items-center justify-center py-3 px-6 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-500 transform hover:scale-105 transition-all duration-300 ease-in-out shimmer-button form-element-animation',
          style: { animationDelay: '0.6s' }
        },
        loading ? React.createElement(Spinner, null) : 'Log In'
      ),
      React.createElement(
        'p',
        { className: 'text-center text-purple-700 dark:text-purple-200 form-element-animation', style: { animationDelay: '0.7s' } },
        "Don't have an account? ",
        React.createElement('button', { type: 'button', onClick: onNavigateToRegister, className: 'font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white' }, 'Sign up')
      )
    )
  );
};

export default LoginScreen;