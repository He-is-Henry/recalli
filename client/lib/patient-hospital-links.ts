import { apiClient } from "./api";
import { Hospital } from "./api";

export type LinkStatus = "PENDING" | "ACTIVE" | "REVOKED";
export type LinkCreatedBy = "patient" | "hospital";

export interface DashboardStats {
  totalPatients: number;
  pendingRequests: number;
  activePatients: number;
}

export interface ClickEvent {
  _id: string;
  boxIndex: number;
  correct: boolean;
  createdAt: string;
}

export interface GameSession {
  _id: string;
  user: string;
  level: number;
  clicks: ClickEvent[];
  found: number[];
  warnings: number[];
  status: "won" | "lost" | "in_progress" | string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PopulatedPatient {
  _id: string;
  email: string;
  publicId?: string;
  createdAt?: string;
}

export interface PopulatedStaff {
  _id: string;
  email: string;
  publicId?: string;
}

export interface PatientHospitalLinkItem {
  _id: string;
  hospitalId: string | Hospital;
  patientId: PopulatedPatient;
  staffId?: PopulatedStaff | null;
  status: LinkStatus;
  createdBy?: LinkCreatedBy;
  createdAt: string;
  updatedAt?: string;
}

// Export alias to maintain compatibility with existing components
export type PopulatedPatientHospitalLink = PatientHospitalLinkItem;

// GET /patient-hospital-links/dashboard-stats
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient("/patient-hospital-links/dashboard-stats");
}

// GET /patient-hospital-links/patients?status=...&search=...
export async function getHospitalPatients(
  status?: LinkStatus,
  search?: string,
): Promise<PatientHospitalLinkItem[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const query = params.toString();
  return apiClient(
    `/patient-hospital-links/patients${query ? `?${query}` : ""}`,
  );
}

// GET /patient-hospital-links/patient/:patientId/sessions
export async function getPatientSessions(
  patientId: string,
): Promise<GameSession[]> {
  return apiClient(`/patient-hospital-links/patient/${patientId}/sessions`);
}

// PATCH /patient-hospital-links/:id/verify
export async function verifyLink(
  linkId: string,
): Promise<PatientHospitalLinkItem> {
  return apiClient(`/patient-hospital-links/${linkId}/verify`, {
    method: "PATCH",
  });
}

// PATCH /patient-hospital-links/:id/revoke
export async function revokeLink(
  linkId: string,
): Promise<PatientHospitalLinkItem> {
  return apiClient(`/patient-hospital-links/${linkId}/revoke`, {
    method: "PATCH",
  });
}

// PATCH /patient-hospital-links/:id/assign-staff
export async function assignStaff(
  linkId: string,
  staffId: string,
): Promise<PatientHospitalLinkItem> {
  return apiClient(`/patient-hospital-links/${linkId}/assign-staff`, {
    method: "PATCH",
    body: JSON.stringify({ staffId }),
  });
}
