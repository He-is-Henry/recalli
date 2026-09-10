"use client";

import { useState } from "react";
import {
  PopulatedPatientHospitalLink,
  LinkStatus,
  verifyLink,
  revokeLink,
  assignStaff,
} from "@/lib/patient-hospital-links";
import { HospitalStaff } from "@/lib/api";
import styles from "./hospital.module.css";

interface Props {
  patients: PopulatedPatientHospitalLink[];
  staffMembers: HospitalStaff[];
  onRefresh: () => void;
  onInspectPatient: (patientId: string, email: string) => void;
}

export default function PatientRoster({
  patients,
  staffMembers,
  onRefresh,
  onInspectPatient,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<LinkStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = patients.filter((item) => {
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesSearch =
      !search ||
      item.patientId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.patientId?.publicId?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleVerify = async (linkId: string) => {
    setUpdatingId(linkId);
    try {
      await verifyLink(linkId);
      onRefresh();
    } catch {
      alert("Failed to verify patient link");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevoke = async (linkId: string) => {
    if (!confirm("Are you sure you want to revoke this patient's access?")) return;
    setUpdatingId(linkId);
    try {
      await revokeLink(linkId);
      onRefresh();
    } catch {
      alert("Failed to revoke patient link");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignStaff = async (linkId: string, staffId: string) => {
    if (!linkId.trim()) return

    setUpdatingId(linkId);
    console.log(linkId)
    try {
      await assignStaff(linkId, staffId);
      onRefresh();
    } catch {
      alert("Failed to assign staff member");
    } finally {
      setUpdatingId(null);
    }
  };

  console.log(filtered)
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Patient Roster & Verification</h3>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.filterTabs}>
          {(["ALL", "PENDING", "ACTIVE", "REVOKED"] as const).map((st) => (
            <button
              key={st}
              className={`${styles.tabBtn} ${statusFilter === st ? styles.activeTab : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search patient email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Status</th>
              <th>Assigned Staff</th>
              <th>Date Requested</th>
              <th>Verification / Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                  No patient records found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div>
                      <strong>{item.patientId?.email ?? "Unknown Patient"}</strong>
                    </div>
                    <small style={{ color: "var(--muted)" }}>
                      {item.patientId?.publicId ?? item.patientId?._id}
                    </small>
                  </td>
                  <td>
                    <span
                      className={
                        item.status === "ACTIVE"
                          ? styles.badgeActive
                          : item.status === "PENDING"
                            ? styles.badgePending
                            : styles.badgeRevoked
                      }
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      className={styles.selectInput}
                      value={item.staffId?._id ?? ""}
                      disabled={updatingId === item._id || item.status !== "ACTIVE"}
                      onChange={(e) => handleAssignStaff(item._id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {staffMembers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.email}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionGroup}>
                      {item.status === "PENDING" && (
                        <button
                          className={styles.btnPrimary}
                          disabled={updatingId === item._id}
                          onClick={() => handleVerify(item._id)}
                        >
                          {updatingId === item._id ? "Verifying..." : "Verify & Accept"}
                        </button>
                      )}

                      {item.status === "ACTIVE" && (
                        <>
                          <button
                            className={styles.btnSecondary}
                            onClick={() =>
                              onInspectPatient(item.patientId._id, item.patientId.email)
                            }
                          >
                            Sessions
                          </button>
                          <button
                            className={styles.btnDanger}
                            disabled={updatingId === item._id}
                            onClick={() => handleRevoke(item._id)}
                          >
                            Revoke
                          </button>
                        </>
                      )}

                      {item.status === "REVOKED" && (
                        <button
                          className={styles.btnPrimary}
                          disabled={updatingId === item._id}
                          onClick={() => handleVerify(item._id)}
                        >
                          Re-verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}