import { User } from "./auth";
import { apiClient } from "./client";

export interface RegisterHospitalDto {
  email: string;
  name: string;
  address?: string;
  adminEmail: string;
  adminPassword: string;
}
export interface Hospital {
  _id: string;
  publicId?: string;
  name: string;
  hospitalCode: string;
  address?: string;
}

export async function registerHospital(data: RegisterHospitalDto): Promise<{
  admin: User;
  hospital: Hospital;
}> {
  return apiClient("/hospitals/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function searchHospitals(query: string): Promise<Hospital[]> {
  return apiClient(`/hospitals/search?q=${encodeURIComponent(query)}`);
}
export async function getMyHospital(): Promise<Hospital> {
  return apiClient("/hospitals/me");
}

export interface HospitalStaff {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateStaffDto {
  email: string;
  password: string;
}

// POST /hospitals/staff
export async function createHospitalStaff(
  dto: CreateStaffDto,
): Promise<HospitalStaff> {
  return apiClient("/hospitals/staff", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// GET /hospitals/staff
export async function getHospitalStaff(): Promise<HospitalStaff[]> {
  return apiClient("/hospitals/staff");
}
