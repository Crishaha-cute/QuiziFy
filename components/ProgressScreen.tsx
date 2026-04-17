import React from 'react';
import { QuizHistory, Difficulty } from '../types.ts';
import Spinner from './Spinner.tsx';

interface ProgressScreenProps {
  history: QuizHistory[];
  isLoading: boolean;
}

const StatCard: React.FC<{ icon: React.ReactElement; label: string; value: string | number; delay: number; colorClass: string }> = ({ icon, label, value, delay, colorClass }) => {
    return (
        <div className="bg-white/40 dark:bg-black/20 p-4 rounded-xl flex items-center space-x-4 border border-purple-300 dark:border-purple-400/20 form-element-animation backdrop-blur-sm" style={{ animationDelay: `${delay}s`}}>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-purple-600 dark:text-purple-300">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

const ProgressScreen: React.FC<ProgressScreenProps> = ({ history, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8"><Spinner /></div>;
  }
  
  const totalQuizzes = history.length;
  
  if (totalQuizzes === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
        <h1 className="text-3xl font-bold mt-4">Your Progress Report</h1>
        <p className="text-purple-600 dark:text-purple-300 mt-2">Complete a quiz to see your stats here!</p>
      </div>
    );
  }

  const averageScore = Math.round(history.reduce((acc, item) => acc + (item.score / item.totalQuestions), 0) / totalQuizzes * 100);
  const bestScore = history.length > 0 ? Math.max(...history.map(item => Math.round((item.score / item.totalQuestions) * 100))) : 0;
  
  const quizzesByDifficulty = history.reduce((acc, item) => {
    acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<Difficulty, number>);
  
  const recentHistory = history.slice(0, 7).reverse();

  return (
    <div className="w-full max-w-4xl mx-auto pt-8 md:pt-12">
      <div className="text-center mb-8 form-element-animation" style={{ animationDelay: '0s'}}>
        <h1 className="text-3xl md:text-4xl font-bold">Your Progress</h1>
        <p className="text-purple-600 dark:text-purple-300 mt-1">Keep up the great work!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-800 dark:text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          label="Quizzes Completed"
          value={totalQuizzes}
          delay={0.1}
          colorClass="bg-purple-400/30 dark:bg-purple-500/30"
        />
        <StatCard 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800 dark:text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625V3.375" /></svg>}
          label="Average Score"
          value={`${averageScore}%`}
          delay={0.2}
          colorClass="bg-green-400/30 dark:bg-green-500/30"
        />
        <StatCard 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-800 dark:text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
          label="Best Score"
          value={`${bestScore}%`}
          delay={0.3}
          colorClass="bg-yellow-400/30 dark:bg-yellow-500/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-purple-300 dark:border-purple-500/30 form-element-animation" style={{ animationDelay: '0.4s'}}>
            <h2 id="chart-title" className="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-200">Recent Performance</h2>
            <div className="h-64 flex pt-4" role="figure" aria-labelledby="chart-title">
                {/* Y Axis Labels */}
                <div className="flex flex-col justify-between h-full pr-3 text-right text-xs text-purple-500 dark:text-purple-300 flex-shrink-0" aria-hidden="true">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                </div>
                
                {/* Chart Area */}
                <div className="w-full h-full overflow-x-auto">
                    <div className="relative h-full flex items-end space-x-2 md:space-x-4 pr-2" style={{ minWidth: `${recentHistory.length * 3.5}rem`}}>
                        {/* Grid lines */}
                        <div className="absolute top-0 left-0 right-0 h-full -z-10" aria-hidden="true">
                            <div className="absolute top-0 w-full h-[1px] bg-purple-300 dark:bg-purple-500/20"></div>
                            <div className="absolute top-1/4 w-full h-[1px] bg-purple-300 dark:bg-purple-500/20"></div>
                            <div className="absolute top-2/4 w-full h-[1px] bg-purple-300 dark:bg-purple-500/20"></div>
                            <div className="absolute top-3/4 w-full h-[1px] bg-purple-300 dark:bg-purple-500/20"></div>
                            <div className="absolute bottom-0 w-full h-[1px] bg-purple-300 dark:bg-purple-500/20"></div>
                        </div>

                        {/* Bars */}
                        {recentHistory.map((item, index) => {
                            const percentage = Math.round((item.score / item.totalQuestions) * 100);
                            const barColor = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                            return (
                                <div key={item.id} className="group flex-1 h-full flex items-end" role="presentation">
                                    <div className="relative w-full h-full flex items-end">
                                        <div 
                                            className={`w-full ${barColor} rounded-t-md hover:opacity-100 opacity-80 transition-all duration-300`}
                                            style={{ height: `${percentage}%`, animation: `bar-rise 0.5s ease-out ${index * 0.1}s backwards`}}
                                            role="img"
                                            aria-label={`Score for quiz on ${item.topic} was ${percentage} percent.`}
                                        ></div>
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 dark:bg-gray-800 text-white px-2 py-1 text-xs rounded-md w-max max-w-[150px] text-center z-10" role="tooltip">
                                            {item.topic} - {percentage}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-purple-300 dark:border-purple-500/30 form-element-animation" style={{ animationDelay: '0.5s'}}>
            <h2 className="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-200">Quizzes by Difficulty</h2>
            <div className="space-y-4">
                {Object.values(Difficulty).map(level => (
                    <div key={level}>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-purple-700 dark:text-purple-200">{level}</span>
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-200">{quizzesByDifficulty[level] || 0} quizzes</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                                className={`${level === Difficulty.EASY ? 'bg-green-500' : level === Difficulty.MEDIUM ? 'bg-yellow-500' : 'bg-red-500'} h-2.5 rounded-full`} 
                                style={{ width: `${((quizzesByDifficulty[level] || 0) / totalQuizzes) * 100}%`, transition: 'width 0.5s ease-in-out' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
       <style>{`
            @keyframes bar-rise {
                from { height: 0%; }
            }
        `}</style>
    </div>
  );
};

export default ProgressScreen;