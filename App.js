import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Difficulty } from './types.js';
import { generateQuiz } from './services/geminiService.js';
import * as authService from './services/authService.js';
import * as historyService from './services/historyService.js';

import SetupScreen from './components/SetupScreen.js';
import QuizScreen from './components/QuizScreen.js';
import ResultsScreen from './components/ResultsScreen.js';
import Spinner from './components/Spinner.js';
import LoginScreen from './components/LoginScreen.js';
import RegisterScreen from './components/RegisterScreen.js';
import ProfileScreen from './components/ProfileScreen.js';
import ProgressScreen from './components/ProgressScreen.js';
import BottomNavBar from './components/BottomNavBar.js';


const NUMBER_OF_QUESTIONS = 10;

const App = () => {
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState(GameState.LOADING);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [currentQuizConfig, setCurrentQuizConfig] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setGameState(GameState.SETUP);
    } else {
      setGameState(GameState.LOGIN);
    }
  }, []);

  useEffect(() => {
    if ((gameState === GameState.PROFILE || gameState === GameState.PROGRESS) && user) {
      const fetchHistory = async () => {
        setIsHistoryLoading(true);
        const history = await historyService.getHistory();
        setQuizHistory(history);
        setIsHistoryLoading(false);
      };
      fetchHistory();
    }
  }, [gameState, user]);


  const handleStartQuiz = useCallback(async (topic, difficulty, fileContent) => {
    setLoadingMessage('Generating your quiz...');
    setGameState(GameState.LOADING);
    setError(null);
    try {
      setCurrentQuizConfig({ topic, difficulty });
      const questions = await generateQuiz(topic, difficulty, NUMBER_OF_QUESTIONS, fileContent);
      if (questions.length < NUMBER_OF_QUESTIONS) {
        throw new Error("Could not generate enough questions for the quiz.");
      }
      setQuiz(questions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setUserAnswers([]);
      setGameState(GameState.QUIZ);
    } catch (err) {
      setError(err.message || 'Unknown error.');
      setGameState(GameState.SETUP);
    }
  }, []);

  const handleAnswerSubmit = useCallback(async (selectedAnswer) => {
    const currentQuestion = quiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    let updatedScore = score;
    if (isCorrect) {
      updatedScore = score + 1;
      setScore(prev => prev + 1);
    }

    const newUserAnswers = [
      ...userAnswers,
      {
        question: currentQuestion.question,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
      },
    ];
    setUserAnswers(newUserAnswers);

    if (currentQuestionIndex >= quiz.length - 1) {
        if (user && currentQuizConfig) {
            await historyService.saveHistory(currentQuizConfig.topic, currentQuizConfig.difficulty, updatedScore, quiz.length);
        }
    }

    setTimeout(() => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setGameState(GameState.RESULTS);
        }
    }, 1500);
  }, [currentQuestionIndex, quiz, userAnswers, score, user, currentQuizConfig]);

  const handlePlayAgain = useCallback(() => {
    setGameState(GameState.SETUP);
    setQuiz([]);
    setCurrentQuizConfig(null);
  }, []);

  const handleQuitQuiz = useCallback(() => {
    setGameState(GameState.SETUP);
    setQuiz([]);
    setCurrentQuizConfig(null);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setGameState(GameState.SETUP);
  };
  
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setGameState(GameState.LOGIN);
    setQuizHistory([]);
  };

  const handleNavigate = (state) => {
    setError(null);
    setGameState(state);
  };


  const renderContent = () => {
    switch (gameState) {
      case GameState.LOGIN:
        return React.createElement(LoginScreen, { onLoginSuccess: handleLoginSuccess, onNavigateToRegister: () => handleNavigate(GameState.REGISTER) });
      case GameState.REGISTER:
        return React.createElement(RegisterScreen, { onRegisterSuccess: handleLoginSuccess, onNavigateToLogin: () => handleNavigate(GameState.LOGIN) });
      case GameState.PROFILE:
        if (!user) return null; // Should not happen
        return React.createElement(ProfileScreen, { user: user, history: quizHistory, onLogout: handleLogout, isLoading: isHistoryLoading });
      case GameState.PROGRESS:
        return React.createElement(ProgressScreen, { history: quizHistory, isLoading: isHistoryLoading });
      case GameState.SETUP:
        return React.createElement(
          React.Fragment,
          null,
          error && React.createElement('div', { className: 'bg-red-500/80 text-white p-4 rounded-lg mb-6 text-center' }, error),
          React.createElement(SetupScreen, { onStartQuiz: handleStartQuiz })
        );
      case GameState.LOADING:
        return React.createElement(
            'div',
            null,
            React.createElement(Spinner, null),
            React.createElement('p', { className: 'text-gray-800 dark:text-white text-center mt-4 text-lg' }, loadingMessage || 'Loading...')
        );
      case GameState.QUIZ:
        return React.createElement(QuizScreen, {
            question: quiz[currentQuestionIndex],
            questionNumber: currentQuestionIndex + 1,
            totalQuestions: quiz.length,
            onAnswerSubmit: handleAnswerSubmit,
            onQuitQuiz: handleQuitQuiz,
        });
      case GameState.RESULTS:
        return React.createElement(ResultsScreen, {
            score: score,
            totalQuestions: quiz.length,
            userAnswers: userAnswers,
            onPlayAgain: handlePlayAgain,
        });
      default:
        return null;
    }
  };

  const isAuthScreen = gameState === GameState.LOGIN || gameState === GameState.REGISTER;
  const showBottomNav = user && (gameState === GameState.SETUP || gameState === GameState.PROFILE || gameState === GameState.PROGRESS);
  const shouldNotBeVerticallyCentered = isAuthScreen || gameState === GameState.SETUP || gameState === GameState.PROFILE || gameState === GameState.PROGRESS;

  return React.createElement(
    'div',
    { className: `min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col items-center p-4 ${shouldNotBeVerticallyCentered ? '' : 'justify-center'}` },
    React.createElement('div', { key: gameState, className: 'w-full page-transition pb-20 md:pb-0' }, renderContent()),
    showBottomNav && React.createElement(BottomNavBar, { activeState: gameState, onNavigate: handleNavigate })
  );
};

export default App;