import {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect,
} from 'react';

// Initial user state
const initialState = {
  username: '',
  email: '',
  profileImage: '',
};

// Reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, ...action.payload };
    case 'UPDATE_USERNAME':
      return { ...state, username: action.payload };
    case 'UPDATE_EMAIL':
      return { ...state, email: action.payload };
    case 'UPDATE_PROFILE_IMAGE':
      return { ...state, profileImage: action.payload };
    default:
      return state;
  }
};

// Context
const UserContext = createContext();

// Provider
export const UserProvider = ({ children }) => {
  const getInitialState = () => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : initialState;
  };

  const [state, dispatch] = useReducer(userReducer, getInitialState());

  // Persist to sessionStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
