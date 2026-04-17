import React, { useState, useEffect } from 'react';
import { Difficulty, QuizType } from '../types.ts';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdfjs - using unpkg CDN for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface SetupScreenProps {
  onStartQuiz: (topic: string, difficulty: Difficulty, quizType: QuizType, fileContent: string | null) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartQuiz }) => {
  const STORAGE_KEY = 'quiz-setup-state-v1';

  const [inputType, setInputType] = useState<'topic' | 'file'>('topic');
  const [topic, setTopic] = useState<string>('World History');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [quizType, setQuizType] = useState<QuizType>(QuizType.MULTIPLE_CHOICE);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Restore previously entered setup values (topic/difficulty/inputType) when returning to this screen
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{
        inputType: 'topic' | 'file';
        topic: string;
        difficulty: Difficulty;
        quizType: QuizType;
      }>;

      if (parsed.inputType === 'topic' || parsed.inputType === 'file') {
        setInputType(parsed.inputType);
      }
      if (typeof parsed.topic === 'string' && parsed.topic.trim().length > 0) {
        setTopic(parsed.topic);
      }
      if (Object.values(Difficulty).includes(parsed.difficulty as Difficulty)) {
        setDifficulty(parsed.difficulty as Difficulty);
      }
      if (Object.values(QuizType).includes(parsed.quizType as QuizType)) {
        setQuizType(parsed.quizType as QuizType);
      }
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist setup values so they don't reset when navigating away and back
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          inputType,
          topic,
          difficulty,
          quizType,
        })
      );
    } catch {
      // ignore storage failures (private mode / quota)
    }
  }, [inputType, topic, difficulty, quizType]);
  
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    setFileContent(null);
    setFile(null);
    setFileName('');
    setIsProcessing(false);

    if (selectedFile) {
      // Increased limit for PDFs (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setFileError("File too large (max 10MB).");
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setIsProcessing(true);
      
      try {
        const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
        
        if (isPDF) {
          // Extract text from PDF
          const text = await extractTextFromPDF(selectedFile);
          if (!text || text.trim().length === 0) {
            setFileError("Could not extract text from PDF. The file might be empty or contain only images.");
            setFile(null);
            setFileName('');
            setIsProcessing(false);
            return;
          }
          setFileContent(text);
        } else {
          // Read text file
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target?.result as string;
            setFileContent(text);
            setIsProcessing(false);
          };
          reader.onerror = () => {
            setFileError("Failed to read file.");
            setIsProcessing(false);
            setFile(null);
            setFileName('');
          };
          reader.readAsText(selectedFile);
          return; // Early return for text files
        }
      } catch (error: any) {
        setFileError(error.message || "Failed to process file. Please try again.");
        setFile(null);
        setFileName('');
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputType === 'topic' && topic.trim()) {
      onStartQuiz(topic, difficulty, quizType, null);
    } else if (inputType === 'file' && file && fileContent) {
      const fileNameAsTopic = file.name.replace(/\.[^/.]+$/, "");
      onStartQuiz(fileNameAsTopic, difficulty, quizType, fileContent);
    }
  };

  const isSubmitDisabled = (inputType === 'topic' && !topic.trim()) || (inputType === 'file' && (!file || !fileContent || !!fileError || isProcessing));

  return (
    <div className="w-full max-w-md mx-auto pt-20">
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
      <p className="text-center text-purple-600 dark:text-purple-200 mb-8 form-element-animation" style={{ animationDelay: '0.3s' }}>Test your knowledge on any topic!</p>
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <div className="form-element-animation" style={{ animationDelay: '0.4s' }}>
          <div className="flex border-b border-purple-300 dark:border-purple-400/50 mb-4">
            <button type="button" onClick={() => setInputType('topic')} className={`flex-1 flex items-center justify-center space-x-2 py-2 text-center font-medium transition-colors ${inputType === 'topic' ? 'text-gray-800 dark:text-white border-b-2 border-purple-500 dark:border-purple-400' : 'text-purple-500 dark:text-purple-300 hover:text-gray-800 dark:hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>From Topic</span>
            </button>
            <button type="button" onClick={() => setInputType('file')} className={`flex-1 flex items-center justify-center space-x-2 py-2 text-center font-medium transition-colors ${inputType === 'file' ? 'text-gray-800 dark:text-white border-b-2 border-purple-500 dark:border-purple-400' : 'text-purple-500 dark:text-purple-300 hover:text-gray-800 dark:hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>From File</span>
            </button>
          </div>

          {inputType === 'topic' ? (
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
                Quiz Topic
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300"
                placeholder="e.g., Space Exploration"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
                Upload Document (.txt, .md, .pdf)
              </label>
              <label className={`w-full flex items-center px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white cursor-pointer hover:bg-gray-300 dark:hover:bg-white/20 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <svg className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span className="truncate">{isProcessing ? 'Processing file...' : (fileName || 'Click to select a file...')}</span>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,.pdf" disabled={isProcessing} />
              </label>
              {fileError && <p className="text-red-400 text-sm mt-2">{fileError}</p>}
            </div>
          )}
        </div>

        <div className="form-element-animation" style={{ animationDelay: '0.5s' }}>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            {Object.values(Difficulty).map((level) => (
              <option key={level} value={level} className="bg-white dark:bg-purple-900 text-gray-800 dark:text-white">
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="form-element-animation" style={{ animationDelay: '0.55s' }}>
          <label htmlFor="quizType" className="block text-sm font-medium text-gray-700 dark:text-purple-100 mb-2">
            Quiz Type
          </label>
          <select
            id="quizType"
            value={quizType}
            onChange={(e) => setQuizType(e.target.value as QuizType)}
            className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-purple-400/50 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-300 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            {Object.values(QuizType).map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-purple-900 text-gray-800 dark:text-white">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full flex items-center justify-center py-3 px-6 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out shimmer-button form-element-animation"
              style={{ animationDelay: '0.6s' }}
            >
              <span>Start Quiz</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
        </div>
      </form>
    </div>
  );
};

export default SetupScreen;