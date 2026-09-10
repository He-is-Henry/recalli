import { DashboardStats } from "../patient-hospital-links";
import { User } from "./auth";
import { apiClient } from "./client";
import type { Hospital } from "./hospitals";
import { GameSession } from "./sessions";

export type LinkStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "REVOKED"
  | "ACTIVE";
export type LinkCreatedBy = "PATIENT" | "HOSPITAL";

export interface PatientHospitalLink {
  _id: string;
  hospitalId: string;
  patientId: string;
  staffId?: string;
  status: LinkStatus;
  createdBy: LinkCreatedBy;
}

export interface PopulatedPatientHospitalLink {
  _id: string;
  hospitalId: Hospital;
  patientId: User;
  staffId?: User;
  status: LinkStatus;
  createdBy: LinkCreatedBy;
  createdAt: Date;
}

export async function connectHospital(
  hospitalId: string,
): Promise<PatientHospitalLink> {
  return apiClient("/patient-hospital-links/connect", {
    method: "POST",
    body: JSON.stringify({ hospitalId }),
  });
}
export async function getMyHospitals(): Promise<
  PopulatedPatientHospitalLink[]
> {
  return apiClient("/patient-hospital-links/my-hospitals");
}
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient("/patient-hospital-links/dashboard-stats");
}
export async function getPatients(
  status?: LinkStatus,
  search?: string,
): Promise<PatientHospitalLink[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  return apiClient(
    `/patient-hospital-links/patients${params.toString() ? `?${params.toString()}` : ""}`,
  );
}
export async function getPatientSessions(
  patientId: string,
): Promise<GameSession[]> {
  return apiClient(`/patient-hospital-links/patient/${patientId}/sessions`);
}
export async function assignStaff(
  linkId: string,
  staffId: string,
): Promise<PatientHospitalLink> {
  return apiClient(`/patient-hospital-links/${linkId}/assign-staff`, {
    method: "PATCH",
    body: JSON.stringify({ staffId }),
  });
}
export async function verifyLink(linkId: string): Promise<PatientHospitalLink> {
  return apiClient(`/patient-hospital-links/${linkId}/verify`, {
    method: "PATCH",
  });
}
export async function revokeLink(linkId: string): Promise<PatientHospitalLink> {
  return apiClient(`/patient-hospital-links/${linkId}/revoke`, {
    method: "PATCH",
  });
}
