import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext'; // The context created in AuthContext.js
import { setAuthToken, getAuthToken, setUserInfo, getUserInfo } from '../lib/api';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On initial load, rehydrate the state from localStorage using your helpers.
  useEffect(() => {
    const token = getAuthToken();
    const userInfo = getUserInfo();

    if (token && userInfo) {
      setAuthToken(token); // Re-configure Axios on page load
      setUser(userInfo);   // Set the user state in React
    }
  }, [user]);

  // The login function now uses your helpers to store data.
  const login = (token, userData) => {
    setAuthToken(token);   // Handles Axios header and localStorage for the token
    setUserInfo(userData); // Handles localStorage for user info
    setUser(userData);     // Updates the React state
  };

  // The logout function also uses your helpers to clear data.
  const logout = () => {
    setAuthToken(null);   // Clears Axios header and localStorage for the token
    setUserInfo(null);    // Clears localStorage for user info
    setUser(null);        // Clears the React state
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
