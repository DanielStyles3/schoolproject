import { createContext, useState, useEffect, useContext } from "react";
import { api } from "@/lib/api";
import type { academicYear, user } from "@/types";

// 1. Create Context
const AuthContext = createContext<{
  user: user | null;
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  setYear: React.Dispatch<React.SetStateAction<academicYear | null>>;
  refreshAuth: () => Promise<void>;
  loading: boolean;
  year: academicYear | null;
}>({
  user: null,
  setUser: () => {},
  setYear: () => {},
  refreshAuth: async () => {},
  loading: true,
  year: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<user | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<academicYear | null>(null);

  const refreshAuth = async () => {
    const [profileResult, yearResult] = await Promise.allSettled([
      api.get("/users/profile"),
      api.get("/academic-years/current"),
    ]);

    if (profileResult.status === "fulfilled") {
      setUser(profileResult.value.data.user);
    } else {
      setUser(null);
    }

    if (yearResult.status === "fulfilled") {
      setYear(yearResult.value.data);
    } else {
      setYear(null);
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await refreshAuth();
      } finally {
        setLoading(false);
      }
    };
    bootstrapAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, setYear, refreshAuth, loading, year }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
