import React from 'react';
import { Difficulty } from '../types.js';
import Spinner from './Spinner.js';

const getDifficultyClass = (difficulty) => {
  switch (difficulty) {
    case Difficulty.EASY: return 'bg-green-500/20 text-green-600 dark:text-green-300';
    case Difficulty.MEDIUM: return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300';
    case Difficulty.HARD: return 'bg-red-500/20 text-red-600 dark:text-red-300';
    default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-300';
  }
};

const ProfileScreen = ({ user, history, onLogout, isLoading }) => {
  return React.createElement(
    'div',
    { className: 'w-full max-w-3xl mx-auto pt-8 md:pt-12' },
    React.createElement(
      'div',
      { className: 'flex flex-col items-center text-center mb-8 form-element-animation', style: { animationDelay: '0s' } },
      React.createElement(
        'div',
        { className: 'w-24 h-24 bg-purple-500/10 dark:bg-purple-500/30 rounded-full flex items-center justify-center border-2 border-purple-500 dark:border-purple-400 mb-4' },
        React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', className: 'h-12 w-12 text-purple-600 dark:text-purple-300', viewBox: '0 0 20 20', fill: 'currentColor' },
          React.createElement('path', { fillRule: 'evenodd', d: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z', clipRule: 'evenodd' })
        )
      ),
      React.createElement('h1', { className: 'text-3xl md:text-4xl font-bold' }, user.username.split('@')[0]),
      React.createElement('p', { className: 'text-purple-600 dark:text-purple-300' }, user.username),
      React.createElement(
        'button',
        {
          onClick: onLogout,
          className: 'mt-4 flex items-center space-x-2 py-2 px-4 bg-red-600/10 dark:bg-red-600/30 text-red-500 dark:text-red-300 font-semibold rounded-lg hover:bg-red-600/20 dark:hover:bg-red-600/50 hover:text-red-600 dark:hover:text-white transition-all'
        },
        React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' })
        ),
        React.createElement('span', null, 'Logout')
      )
    ),
    React.createElement(
      'div',
      { className: 'bg-white/60 dark:bg-black/30 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-purple-300 dark:border-purple-500/30 form-element-animation', style: { animationDelay: '0.1s' } },
      React.createElement('h2', { className: 'text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-200 text-center' }, 'Quiz History'),
      isLoading
        ? React.createElement('div', { className: 'text-center py-8' }, React.createElement(Spinner, null))
        : history.length > 0
        ? React.createElement(
            'div',
            { className: 'space-y-4 max-h-[50vh] overflow-y-auto pr-2' },
            history.map(item => {
              const percentage = Math.round((item.score / item.totalQuestions) * 100);
              return React.createElement(
                'div',
                { key: item.id, className: 'bg-gray-200/50 dark:bg-white/5 p-4 rounded-lg border border-purple-200 dark:border-purple-400/20 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-purple-400 dark:hover:border-purple-400/50 transition-all transform hover:scale-[1.02]' },
                React.createElement(
                  'div',
                  { className: 'flex justify-between items-start' },
                  React.createElement(
                    'div',
                    { className: 'flex-1 pr-4' },
                    React.createElement('p', { className: 'font-bold text-lg leading-tight' }, item.topic),
                    React.createElement('p', { className: 'text-sm text-purple-600 dark:text-purple-300' }, item.date)
                  ),
                  React.createElement(
                    'div',
                    { className: 'text-right flex-shrink-0' },
                    React.createElement('p', { className: 'text-2xl font-bold' }, `${percentage}%`),
                    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, `${item.score} / ${item.totalQuestions}`)
                  )
                ),
                React.createElement('div', { className: `mt-2 text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getDifficultyClass(item.difficulty)}` }, item.difficulty)
              );
            })
          )
        : React.createElement(
            'div',
            { className: 'text-center text-gray-500 dark:text-gray-400 py-10' },
            React.createElement(
              'svg',
              { xmlns: 'http://www.w3.org/2000/svg', className: 'mx-auto h-12 w-12 text-gray-400 dark:text-gray-500', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
            ),
            React.createElement('p', { className: 'mt-4' }, "You haven't completed any quizzes yet.")
          )
    )
  );
};

export default ProfileScreen;