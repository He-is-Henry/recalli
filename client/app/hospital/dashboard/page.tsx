"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMyHospital, Hospital, getHospitalStaff, HospitalStaff, ApiError } from "@/lib/api";
import {
  getDashboardStats,
  getHospitalPatients,
  DashboardStats,
  PatientHospitalLinkItem,
} from "@/lib/patient-hospital-links";
import { removeToken } from "@/lib/auth";

import OverviewStats from "@/components/hospital/OverviewStats";
import PatientRoster from "@/components/hospital/PatientRoster";
import StaffManager from "@/components/hospital/StaffManager";
import PatientSessionsModal from "@/components/hospital/PatientSessionsModal";

import pageStyles from "./dashboard.module.css";

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // Fixed state type: must be PatientHospitalLinkItem[] to retain link status & ID
  const [patients, setPatients] = useState<PatientHospitalLinkItem[]>([]);
  const [staffList, setStaffList] = useState<HospitalStaff[]>([]);

  const [inspectPatient, setInspectPatient] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    try {
      const [hospData, statsData, patientData, staffData] = await Promise.all([
        getMyHospital(),
        getDashboardStats(),
        getHospitalPatients(),
        getHospitalStaff(),
      ]);

      setHospital(hospData);
      setStats(statsData);
      setPatients(patientData);
      setStaffList(staffData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    removeToken();
    router.replace("/login");
  };

  if (loading) {
    return (
      <main className={pageStyles.main}>
        <div className={pageStyles.loadingState}>
          <div className={pageStyles.spinner} />
          <p>Loading hospital portal...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={pageStyles.main}>
        <div className={pageStyles.errorCard}>
          <h2>Portal Access Error</h2>
          <p>{error}</p>
          <button onClick={handleLogout} className={pageStyles.logoutBtn}>
            Return to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={pageStyles.main}>
      <header className={pageStyles.header}>
        <div className={pageStyles.brandRow}>
          <h1 className={pageStyles.logo}>Recalli</h1>
          <span className={pageStyles.portalBadge}>Hospital Administration</span>
        </div>
        <button onClick={handleLogout} className={pageStyles.logoutBtn}>
          Logout
        </button>
      </header>

      <div className={pageStyles.content}>
        <section className={pageStyles.welcomeBanner}>
          <h2>{hospital?.name}</h2>
          <p>
            Hospital Code: <strong>{hospital?.hospitalCode || hospital?.publicId}</strong>
          </p>
        </section>

        <OverviewStats stats={stats} />

        <PatientRoster
          patients={patients}
          staffMembers={staffList}
          onRefresh={loadDashboardData}
          onInspectPatient={(patientId, email) => setInspectPatient({ id: patientId, email })}
        />

        <StaffManager staffList={staffList} onRefresh={loadDashboardData} />
      </div>

      {inspectPatient && (
        <PatientSessionsModal
          patientId={inspectPatient.id}
          patientEmail={inspectPatient.email}
          onClose={() => setInspectPatient(null)}
        />
      )}
    </main>
  );
}