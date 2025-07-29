"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, saveToken, removeToken } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // При зареждане - проверяваме дали има токен
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const login = (token) => {
    saveToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
