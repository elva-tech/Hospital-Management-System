import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  token: string;
}

interface AuthState {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Load initial state from local storage
const getUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('hms_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getUserFromStorage(),
  login: (userData: User) => {
    localStorage.setItem('hms_user', JSON.stringify(userData));
    set({ user: userData });
  },
  logout: () => {
    localStorage.removeItem('hms_user');
    set({ user: null });
  },
}));
