"use client";

import { useEffect, useState } from "react";
import { getPatientSessions, GameSession } from "@/lib/patient-hospital-links";
import { ApiError } from "@/lib/api";
import styles from "./hospital.module.css";

interface Props {
  patientId: string;
  patientEmail: string;
  onClose: () => void;
}

export default function PatientSessionsModal({ patientId, patientEmail, onClose }: Props) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await getPatientSessions(patientId);
        setSessions(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [patientId]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.title}>Game Session History</h3>
            <small style={{ color: "var(--muted)" }}>{patientEmail}</small>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading performance data...</p>
        ) : error ? (
          <p style={{ color: "var(--danger)", textAlign: "center", padding: "2rem" }}>{error}</p>
        ) : sessions.length === 0 ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
            No recorded game sessions found for this patient.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Outcome</th>
                  <th>Clicks</th>
                  <th>Duration</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => (
                  <tr key={sess._id}>
                    <td>
                      <strong>Level {sess.level}</strong>
                    </td>
                    <td>
                      <span
                        className={
                          sess.status === "won"
                            ? styles.badgeActive
                            : styles.badgeRevoked
                        }
                      >
                        {sess.status ? sess.status.toUpperCase() : "COMPLETED"}
                      </span>
                    </td>
                    <td>{sess.clicks ? sess.clicks.length : 0} clicks</td>
                    <td>{sess.duration !== undefined ? `${sess.duration}s` : "-"}</td>
                    <td>
                      {new Date(sess.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}