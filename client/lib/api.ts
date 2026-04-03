import { getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    if (!res.ok) {
      const body = await res
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new ApiError(res.status, body.message || "Request failed");
    }
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// --- Auth ---
export const signup = (email: string, password: string) =>
  request<{ accessToken: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const login = (email: string, password: string) =>
  request<{ accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = () =>
  request<{ id: string; email: string; role: string }>("/auth/me");

// --- Levels ---
export const getLevels = () => request<Level[]>("/levels");

// --- Game ---
export const startSession = (level: number) =>
  request<GameSession>(`/game-sessions/${level}/start`);

export const clickTile = (level: number, boxIndex: number) =>
  request<ClickResult>(`/game-sessions/${level}/click`, {
    method: "POST",
    body: JSON.stringify({ boxIndex }),
  });

export const restartSession = (level: number) =>
  request<GameSession>(`/game-sessions/${level}/restart`, {
    method: "POST",
  });

// --- Types ---
export interface Level {
  _id: string;
  level: number;
  grid: [number, number];
  story: string;
  audio?: string;
  video?: string;
  status: "playing" | "won" | "lost" | null;
  progress: number;
}

export interface GameSession {
  level: number;
  grid: [number, number];
  story: string;
  audio?: string;
  video?: string;
  found: number[];
  warnings: number[];
  status: "playing" | "won" | "lost";
  totalCorrect: number;
}

export interface ClickResult {
  correct: boolean;
  found: number[];
  warnings: number[];
  status: "playing" | "won" | "lost";
  alreadyWarned?: boolean;
}

// Admin

export const getAdmins = () =>
  request<{ email: string; role: string; _id: string }[]>("/users?role=admin");

export const makeAdmins = (email: string) =>
  request<{ email: string; role: string }>("/users/promote", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
export interface LevelWithPattern extends Level {
  _id: string;
  pattern: number[];
}

export const adminGetLevels = () => request<LevelWithPattern[]>("/levels/all");

export const adminGetLevel = (id: string) =>
  request<LevelWithPattern>(`/levels/${id}`);

export const adminCreateLevel = (data: {
  level: number;
  grid: number[];
  pattern: number[];
  story: string;
  audio?: string;
  video?: string;
}) =>
  request<LevelWithPattern>("/levels", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminUpdateLevel = (
  id: string,
  data: Partial<{
    level: number;
    grid: number[];
    pattern: number[];
    story: string;
    audio?: string;
    video?: string;
  }>,
) =>
  request<LevelWithPattern>(`/levels/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const adminDeleteLevel = (id: string) =>
  request<void>(`/levels/${id}`, { method: "DELETE" });
