import { apiClient } from "./client";

export interface User {
  _id: string;
  publicId?: string;
  name?: string;
  email: string;
  role: string;
}

export async function login(
  email: string,
  password: string,
): Promise<{ accessToken: string }> {
  const body = { email, password };
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function signup(
  email: string,
  password: string,
): Promise<{ accessToken: string }> {
  const body = { email, password };
  return apiClient("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getMe(): Promise<User> {
  return apiClient("/auth/me");
}
export async function getAdmins(): Promise<User[]> {
  return apiClient("/admin/users");
}
export async function makeAdmins(userIds: string[] | string): Promise<User> {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  return apiClient("/admin/make-admin", {
    method: "POST",
    body: JSON.stringify({ userIds: ids }),
  });
}
