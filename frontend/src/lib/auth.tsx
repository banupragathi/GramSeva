"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type RoleValue =
  | "admin"
  | "survey_officer"
  | "reviewer"
  | "demo";

export interface AuthUser {
  name: string;
  email: string;
  role: RoleValue;
}

export const ROLES = {
  admin: {
    value: "admin" as const,
    label: "Administrator",
    description: "Full platform access and system management.",
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200",
  },

  survey_officer: {
    value: "survey_officer" as const,
    label: "Survey Officer",
    description:
      "Access land data, maps and survey workflows.",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  reviewer: {
    value: "reviewer" as const,
    label: "Reviewer",
    description:
      "Review conflicts, changes and harmonization results.",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  demo: {
    value: "demo" as const,
    label: "Demo User",
    description:
      "Demonstration access to the GramSeva platform.",
    badgeClass:
      "bg-primary/10 text-primary border-primary/20",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  ready: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  setRole: (role: RoleValue) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const STORAGE_KEY = "gramseva_user";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;

        if (
          parsed &&
          typeof parsed.name === "string" &&
          typeof parsed.email === "string" &&
          parsed.role in ROLES
        ) {
          setUser(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to restore GramSeva session:",
        error
      );

      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  const signIn = (newUser: AuthUser) => {
    setUser(newUser);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newUser)
    );
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const setRole = (role: RoleValue) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        role,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        signIn,
        signOut,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}