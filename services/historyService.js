import { Difficulty } from '../types.js';
import { getCurrentUser } from './authService.js';

const getHistoryKey = () => {
    const user = getCurrentUser();
    if (!user) return null;
    return `quiz-history-${user.id}`;
};

export const getHistory = async () => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const key = getHistoryKey();
    if (!key) return [];
    
    const historyJson = localStorage.getItem(key);
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Sort by date descending, as a real backend would
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const saveHistory = async (topic, difficulty, score, totalQuestions) => {
    const key = getHistoryKey();
    if (!key) {
        console.error("Cannot save history: no user is logged in.");
        return;
    }

    // Get current history without sorting it, to prepend new entry
    const historyJson = localStorage.getItem(key);
    const currentHistory = historyJson ? JSON.parse(historyJson) : [];
    
    const newHistoryEntry = {
        id: new Date().toISOString(), // Use ISO string for a unique ID
        topic,
        difficulty,
        score,
        totalQuestions,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };

    const updatedHistory = [newHistoryEntry, ...currentHistory];
    localStorage.setItem(key, JSON.stringify(updatedHistory));
};