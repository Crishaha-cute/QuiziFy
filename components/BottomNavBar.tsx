import React from 'react';
import { GameState } from '../types.ts';

interface BottomNavBarProps {
    activeState: GameState;
    onNavigate: (state: GameState) => void;
    isAdmin?: boolean;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeState, onNavigate, isAdmin }) => {
    const navItems = [
        { state: GameState.SETUP, label: 'Quiz', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
        { state: GameState.LEADERBOARD, label: 'Leaderboard', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6m6 13V10M5 19V12m14 7H3" /> },
        { state: GameState.PROGRESS, label: 'Progress', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
        { state: GameState.PROFILE, label: 'Profile', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> }
    ];

    const items = isAdmin
      ? [
        ...navItems.slice(0, 2),
        { state: GameState.ADMIN_DASHBOARD, label: 'Admin', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a4 4 0 110 8a4 4 0 010-8zm-7 16a7 7 0 0114 0M7 4h10" /> },
        ...navItems.slice(2),
      ]
      : navItems;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-300 dark:border-purple-500/30 md:max-w-md md:mx-auto md:rounded-t-2xl">
            <div className="flex justify-around max-w-xs mx-auto">
                {items.map(item => (
                    <button
                        key={item.label}
                        onClick={() => onNavigate(item.state)}
                        className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors ${activeState === item.state ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        aria-label={`Go to ${item.label}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{item.icon}</svg>
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavBar;