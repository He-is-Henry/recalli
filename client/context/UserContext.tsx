"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, User, ApiError } from "@/lib/api";
import { removeToken } from "@/lib/auth";

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const data = await getMe();
      setUser(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    removeToken();
    setUser(null);
    router.replace("/login");
  };

  return (
    <UserContext.Provider
      value={{ user, loading, error, logout, refreshUser: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}