import { getToken, removeToken, setToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let refreshQueue: ((success: boolean) => void)[] = [];

function processQueue(success: boolean) {
  refreshQueue.forEach((resolve) => resolve(success));
  refreshQueue = [];
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetchWithAuth(path, options);

  if (res.status === 401 && path !== "/auth/login") {
    console.log(path);
    const refreshed = await tryRefresh();
    if (!refreshed) {
      removeToken();
      throw new ApiError(401, "Session expired");
    }
    const retried = await fetchWithAuth(path, options);
    if (!retried.ok) {
      const body = await retried
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new ApiError(retried.status, (body as { message: string }).message);
    }
    return retried.json() as Promise<T>;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(res.status, (body as { message: string }).message);
  }

  return res.json() as Promise<T>;
}

function fetchWithAuth(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include", // sends httpOnly cookie automatically
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) {
    // Already refreshing — join the queue and wait
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      processQueue(false);
      return false;
    }
    const { accessToken } = (await res.json()) as { accessToken: string };
    setToken(accessToken);
    processQueue(true);
    return true;
  } catch {
    processQueue(false);
    return false;
  } finally {
    isRefreshing = false;
  }
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
export const reviewSession = (level: number) =>
  request<ReviewResult>(`/game-sessions/${level}/review`, {
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
  status: "playing" | "won" | "lost";
  totalCorrect: number;
  warnings: number;
}

export interface ClickResult {
  correct: boolean;
  found: number[];
  warnings: number;
  status: "playing" | "won" | "lost";
  alreadyWarned?: boolean;
}

export interface ReviewResult {
  level: number;
  grid: number;
  clicks: {
    boxIndex: number;
    correct: boolean;
    createdAt: string;
  }[];
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
