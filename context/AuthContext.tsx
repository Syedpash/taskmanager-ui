"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    token: string | null;
    username: string | null;
    login: (token: string, username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    // on app load, read token from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUsername = localStorage.getItem("username");
        if (savedToken) setToken(savedToken);
        if (savedUsername) setUsername(savedUsername);
    }, []);

    const login = (newToken: string, newUsername: string) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("username", newUsername);
        document.cookie = `token=${newToken}; path=/`;
        setToken(newToken);
        setUsername(newUsername);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setToken(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider
            value={{ token, username, login, logout, isAuthenticated: !!token }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// custom hook — any component calls useAuth() to access auth state
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}