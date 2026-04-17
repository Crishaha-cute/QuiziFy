const USERS_KEY = 'quiz-app-users';
const CURRENT_USER_KEY = 'quiz-app-current-user';

// Helper to get all users from localStorage
const getUsers = () => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save all users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const login = async (email, password) => {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users = getUsers();
  const user = users.find(u => u.username === email); // We use username as email

  // NOTE: This mock does not check the password. In a real app, you would.
  if (!user) {
    throw new Error('User not found. Please check your email or register.');
  }
  
  // Store the logged-in user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const register = async (email, password) => {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let users = getUsers();
  if (users.find(u => u.username === email)) {
    throw new Error('An account with this email already exists.');
  }

  // Create a new user. In a real DB, ID would be auto-incremented.
  const newUser = {
    id: Date.now(), // Simple unique ID for mock
    username: email,
  };

  users.push(newUser);
  saveUsers(users);

  // Automatically log in the new user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      logout();
      return null;
    }
  }
  return null;
};