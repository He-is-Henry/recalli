import { apiClient } from "./client";

export interface ClickRecord {
  boxIndex: number;
  correct?: boolean;
  isCorrect?: boolean;
}

export interface ReviewResult {
  success?: boolean;
  score?: number;
  message?: string;
  status?: string;
  clicks: ClickRecord[];
}

export interface GameSession {
  _id: string;
  level: number;
  userId: string;
  status: "in_progress" | "completed" | "failed" | "playing" | "won" | "lost";
  found: number[];
  totalCorrect: number;
  warnings: number;
  grid: [number, number];
  story?: string;
  audio?: string;
  video?: string;
  duration?: number;
}

export async function getMySessions(): Promise<GameSession[]> {
  return apiClient("/game-sessions/me");
}
export async function startSession(level: number): Promise<GameSession> {
  return apiClient(`/game-sessions/${level}/start`);
}
export async function clickTile(level: number, boxIndex: number): Promise<any> {
  return apiClient(`/game-sessions/${level}/click`, {
    method: "POST",
    body: JSON.stringify({ boxIndex }),
  });
}
export async function restartSession(level: number): Promise<GameSession> {
  return apiClient(`/game-sessions/${level}/restart`, { method: "POST" });
}
export async function reviewSession(level: number): Promise<ReviewResult> {
  return apiClient(`/game-sessions/${level}/review`, { method: "POST" });
}
