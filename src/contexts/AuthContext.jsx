import React, { createContext, useContext, useState, useEffect } from "react";
import storefrontApi from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("customer_access_token");
    const savedUser = localStorage.getItem("customer_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // corrupted data, clear
        localStorage.removeItem("customer_access_token");
        localStorage.removeItem("customer_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email) => {
    const result = await storefrontApi.auth.login(email);
    localStorage.setItem("customer_access_token", result.access_token);
    localStorage.setItem("customer_user", JSON.stringify(result.user));
    setToken(result.access_token);
    setUser(result.user);
    return result;
  };

  const signup = async (data) => {
    const result = await storefrontApi.auth.signup(data);
    localStorage.setItem("customer_access_token", result.access_token);
    localStorage.setItem("customer_user", JSON.stringify(result.user));
    setToken(result.access_token);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    localStorage.removeItem("customer_access_token");
    localStorage.removeItem("customer_user");
    setToken(null);
    setUser(null);
  };

  const googleLogin = async (credential) => {
    const result = await storefrontApi.auth.googleAuth({ credential });
    localStorage.setItem("customer_access_token", result.access_token);
    localStorage.setItem("customer_user", JSON.stringify(result.user));
    setToken(result.access_token);
    setUser(result.user);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, googleLogin, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
