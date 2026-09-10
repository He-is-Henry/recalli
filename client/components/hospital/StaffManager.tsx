"use client";

import { useState } from "react";
import { HospitalStaff, createHospitalStaff, ApiError } from "@/lib/api";
import styles from "./hospital.module.css";

interface Props {
  staffList: HospitalStaff[];
  onRefresh: () => void;
}

export default function StaffManager({ staffList, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createHospitalStaff({ email, password });
      setEmail("");
      setPassword("");
      setShowModal(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Hospital Staff Accounts</h3>
        <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
          + Add Staff
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Staff Email</th>
              <th>Role</th>
              <th>Added On</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "1.5rem" }}>
                  No staff members created yet.
                </td>
              </tr>
            ) : (
              staffList.map((s) => (
                <tr key={s._id}>
                  <td>{s.email}</td>
                  <td><span className={styles.badgeActive}>{s.role}</span></td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.title}>Create Staff Account</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Staff Email</label>
                <input
                  type="email"
                  className={styles.searchInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  className={styles.searchInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}

              <div className={styles.actionGroup} style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}