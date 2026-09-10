"use client";

import { DashboardStats } from "@/lib/patient-hospital-links";
import styles from "./hospital.module.css";

interface Props {
  stats: DashboardStats | null;
}

export default function OverviewStats({ stats }: Props) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats?.totalPatients ?? 0}</span>
        <span className={styles.statLabel}>Total Linked Patients</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats?.activePatients ?? 0}</span>
        <span className={styles.statLabel}>Active Relationships</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats?.pendingRequests ?? 0}</span>
        <span className={styles.statLabel}>Pending Link Requests</span>
      </div>
    </div>
  );
}