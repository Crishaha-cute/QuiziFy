import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion } from '../types.ts';

interface QuizScreenProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmit: (answer: string) => void;
  onQuitQuiz: () => void;
}

const QUESTION_TIME = 20;

const QuizScreen: React.FC<QuizScreenProps> = ({ question, questionNumber, totalQuestions, onAnswerSubmit, onQuitQuiz }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
    setTypedAnswer('');
    setTimeLeft(QUESTION_TIME);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [question]);

  useEffect(() => {
    if (timeLeft === 0 && selectedAnswer === null) {
      setSelectedAnswer(''); // Set dummy answer to lock UI
      onAnswerSubmit(''); // Submit "no answer"
    }
  }, [timeLeft, selectedAnswer, onAnswerSubmit]);


  const handleAnswerClick = (option: string) => {
    if (selectedAnswer === null) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setSelectedAnswer(option);
      onAnswerSubmit(option);
    }
  };

  const isIdentification =
    question.questionType === 'Identification' ||
    (Array.isArray(question.options) && question.options.length === 0);
  const isTrueFalse =
    question.questionType === 'True or False' ||
    (Array.isArray(question.options) &&
      question.options.length === 2 &&
      question.options.every((o) => ['true', 'false'].includes(String(o).toLowerCase())));

  const handleIdentificationSubmit = () => {
    if (selectedAnswer !== null) return;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setSelectedAnswer(typedAnswer);
    onAnswerSubmit(typedAnswer);
  };
  
  const getButtonClass = (option: string) => {
    if (selectedAnswer === null) {
      return 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 border-purple-300 dark:border-purple-400/50';
    }
    if (option === question.correctAnswer) {
      return 'bg-green-500/80 border-green-400 animate-pulse text-white';
    }
    if (option === selectedAnswer) {
      return 'bg-red-500/80 border-red-400 animate-pulse text-white';
    }
    return 'bg-gray-200 dark:bg-white/10 border-purple-300 dark:border-purple-400/50 opacity-50 cursor-not-allowed';
  };

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / QUESTION_TIME;
  const offset = circumference * (1 - progress);
  const strokeColor = timeLeft > 10 ? 'stroke-green-400' : timeLeft > 5 ? 'stroke-yellow-400' : 'stroke-red-400';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center text-center mb-6">
        <p className="text-purple-600 dark:text-purple-300 text-lg w-1/3 text-left">Question {questionNumber} / {totalQuestions}</p>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 52 52">
            <circle
              className="stroke-purple-400/30"
              strokeWidth="4"
              fill="transparent"
              r={radius}
              cx="26"
              cy="26"
            />
            <circle
              className={`transform -rotate-90 origin-center transition-all duration-1000 linear ${strokeColor}`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="26"
              cy="26"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
            {timeLeft}
          </span>
        </div>
        <div className="w-1/3 flex justify-end">
            <button
                onClick={onQuitQuiz}
                className="flex items-center space-x-1.5 text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-white font-semibold py-1 px-3 rounded-md hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Quit</span>
            </button>
        </div>
      </div>
      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-purple-300 dark:border-purple-500/30">
        <div key={question.question} className="page-transition">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center" dangerouslySetInnerHTML={{ __html: question.question }}></h2>
          {isIdentification ? (
            <div className="space-y-4">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={selectedAnswer !== null}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleIdentificationSubmit();
                  }
                }}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300"
                placeholder="Type your answer..."
              />
              <button
                onClick={handleIdentificationSubmit}
                disabled={selectedAnswer !== null}
                className="w-full py-3 px-6 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
              >
                Submit
              </button>
              {selectedAnswer !== null && (
                <div className="mt-2 text-center">
                  <p className={selectedAnswer === question.correctAnswer ? 'text-green-600 dark:text-green-300 font-semibold' : 'text-red-600 dark:text-red-300 font-semibold'}>
                    Correct answer: <span dangerouslySetInnerHTML={{ __html: question.correctAnswer }} />
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(isTrueFalse ? ['True', 'False'] : question.options).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-lg border text-left text-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${getButtonClass(option)}`}
                  dangerouslySetInnerHTML={{ __html: option }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;