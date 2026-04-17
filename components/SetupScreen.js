import React, { useState } from 'react';
import { Difficulty } from '../types.js';

const SetupScreen = ({ onStartQuiz }) => {
  const [inputType, setInputType] = useState('topic');
  const [topic, setTopic] = useState('World History');
  const [difficulty, setDifficulty] = useState(Difficulty.EASY);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [fileError, setFileError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    setFileContent(null);
    setFile(null);
    setFileName('');

    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
        setFileError("File too large (max 2MB).");
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        setFileContent(text);
      };
      reader.onerror = () => {
        setFileError("Failed to read file.");
      };
      reader.readAsText(selectedFile);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputType === 'topic' && topic.trim()) {
      onStartQuiz(topic, difficulty, null);
    } else if (inputType === 'file' && file && fileContent) {
      const fileNameAsTopic = file.name.replace(/\.[^/.]+$/, "");
      onStartQuiz(fileNameAsTopic, difficulty, fileContent);
    }
  };

  const isSubmitDisabled = (inputType === 'topic' && !topic.trim()) || (inputType === 'file' && (!file || !fileContent || !!fileError));

  return React.createElement(
    'div',
    { className: 'w-full max-w-md mx-auto pt-20' },
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
    React.createElement('p', { className: 'text-center text-purple-600 dark:text-purple-200 mb-8 form-element-animation', style: { animationDelay: '0.3s' } }, 'Test your knowledge on any topic!'),
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'space-y-6' },
      React.createElement(
        'div',
        { className: 'form-element-animation', style: { animationDelay: '0.4s' } },
        React.createElement(
          'div',
          { className: 'flex border-b border-purple-300 dark:border-purple-400/50 mb-4' },
          React.createElement(
            'button',
            { type: 'button', onClick: () => setInputType('topic'), className: `flex-1 flex items-center justify-center space-x-2 py-2 text-center font-medium transition-colors ${inputType === 'topic' ? 'text-gray-800 dark:text-white border-b-2 border-purple-500 dark:border-purple-400' : 'text-purple-500 dark:text-purple-300 hover:text-gray-800 dark:hover:text-white'}` },
            React.createElement(
              'svg',
              { xmlns: 'http://www.w3.org/2000/svg', className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
            ),
            React.createElement('span', null, 'From Topic')
          ),
          React.createElement(
            'button',
            { type: 'button', onClick: () => setInputType('file'), className: `flex-1 flex items-center justify-center space-x-2 py-2 text-center font-medium transition-colors ${inputType === 'file' ? 'text-gray-800 dark:text-white border-b-2 border-purple-500 dark:border-purple-400' : 'text-purple-500 dark:text-purple-300 hover:text-gray-800 dark:hover:text-white'}` },
            React.createElement(
              'svg',
              { xmlns: 'http://www.w3.org/2000/svg', className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
            ),
            React.createElement('span', null, 'From File')
          )
        ),
        inputType === 'topic'
          ? React.createElement(
              'div',
              null,
              React.createElement('label', { htmlFor: 'topic', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Quiz Topic'),
              React.createElement('input', {
                type: 'text',
                id: 'topic',
                value: topic,
                onChange: (e) => setTopic(e.target.value),
                className: 'w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300',
                placeholder: 'e.g., Space Exploration'
              })
            )
          : React.createElement(
              'div',
              null,
              React.createElement('label', { htmlFor: 'file-upload', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Upload Document (.txt, .md)'),
              React.createElement(
                'label',
                { className: 'w-full flex items-center px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white cursor-pointer hover:bg-gray-300 dark:hover:bg-white/20 transition-colors' },
                React.createElement(
                  'svg',
                  { className: 'w-6 h-6 mr-3 text-purple-600 dark:text-purple-300', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' })
                ),
                React.createElement('span', { className: 'truncate' }, fileName || 'Click to select a file...'),
                React.createElement('input', { id: 'file-upload', type: 'file', className: 'hidden', onChange: handleFileChange, accept: '.txt,.md' })
              ),
              fileError && React.createElement('p', { className: 'text-red-400 text-sm mt-2' }, fileError)
            )
      ),
      React.createElement(
        'div',
        { className: 'form-element-animation', style: { animationDelay: '0.5s' } },
        React.createElement('label', { htmlFor: 'difficulty', className: 'block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2' }, 'Difficulty'),
        React.createElement(
          'select',
          {
            id: 'difficulty',
            value: difficulty,
            onChange: (e) => setDifficulty(e.target.value),
            className: 'w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300 appearance-none',
            style: { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }
          },
          Object.values(Difficulty).map((level) =>
            React.createElement('option', { key: level, value: level, className: 'bg-white dark:bg-purple-900 text-gray-800 dark:text-white' }, level)
          )
        )
      ),
      React.createElement(
        'button',
        {
          type: 'submit',
          disabled: isSubmitDisabled,
          className: 'w-full flex items-center justify-center py-3 px-6 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out shimmer-button form-element-animation',
          style: { animationDelay: '0.6s' }
        },
        React.createElement('span', null, 'Start Quiz'),
        React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', className: 'h-5 w-5 ml-2', viewBox: '0 0 20 20', fill: 'currentColor' },
          React.createElement('path', { fillRule: 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z', clipRule: 'evenodd' })
        )
      )
    )
  );
};

export default SetupScreen;