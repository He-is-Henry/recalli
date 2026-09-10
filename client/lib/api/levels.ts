import { apiClient } from "./client";

export interface Level {
  _id: string;
  level: number;
  levelNumber?: number;
  title: string;
  description?: string;
  gridSize?: number;
  grid: [number, number];
  story: string;
  audio?: string;
  video?: string;
  bestTime: number;
  status: "locked" | "unlocked" | "completed" | "playing" | "won" | "lost";
  progress?: number;
}
export interface LevelWithPattern extends Level {
  pattern: number[];
}

export async function getLevels(): Promise<Level[]> {
  return apiClient("/levels");
}
export async function adminGetLevels(): Promise<LevelWithPattern[]> {
  return apiClient("/levels/admin");
}
export async function adminGetLevel(id: string): Promise<LevelWithPattern> {
  return apiClient(`/levels/admin/${id}`);
}
export async function adminCreateLevel(
  payload: Partial<LevelWithPattern>,
): Promise<LevelWithPattern> {
  return apiClient("/levels/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function adminUpdateLevel(
  id: string,
  payload: Partial<LevelWithPattern>,
): Promise<LevelWithPattern> {
  return apiClient(`/levels/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
export async function adminDeleteLevel(id: string): Promise<void> {
  return apiClient(`/levels/admin/${id}`, { method: "DELETE" });
}
