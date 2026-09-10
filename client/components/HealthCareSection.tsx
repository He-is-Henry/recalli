"use client";

import { useEffect, useState } from "react";
import {
  searchHospitals,
  connectHospital,
  getMyHospitals,
  Hospital,
  PopulatedPatientHospitalLink,
  ApiError,
} from "@/lib/api";
import styles from "@/app/(protected)/levels/levels.module.css";

export default function HealthcareSection() {
  const [myHospitals, setMyHospitals] = useState<PopulatedPatientHospitalLink[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [hospitalMsg, setHospitalMsg] = useState("");

  useEffect(() => {
    getMyHospitals().then(setMyHospitals).catch(console.error);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      searchHospitals(searchQuery)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleConnect = async (hospitalId: string) => {
    setConnectingId(hospitalId);
    setHospitalMsg("");
    try {
      await connectHospital(hospitalId);
      setHospitalMsg("Link request sent successfully!");
      setSearchQuery("");
      setSearchResults([]);
      const updated = await getMyHospitals();
      setMyHospitals(updated);
    } catch (err) {
      setHospitalMsg(
        err instanceof ApiError ? err.message : "Failed to connect to hospital"
      );
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <section className={styles.hospitalSection}>
      <h2 className={styles.sectionTitle}>Healthcare Providers</h2>

      {myHospitals.length > 0 && (
        <div className={styles.linkedList}>
          {myHospitals.map((link) => (
            <div key={link._id} className={styles.hospitalBadge}>
              <div>
                <strong>{link.hospitalId.name}</strong> (
                {link.hospitalId.publicId || link.hospitalId.hospitalCode})
              </div>
              <span
                className={
                  link.status === "ACTIVE"
                    ? styles.statusActive
                    : styles.statusPending
                }
              >
                {link.status === "ACTIVE"
                  ? "Connected ✓"
                  : "Pending Verification ⏳"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search hospital by name or ID (e.g. HOSP-1)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {isSearching && <span className={styles.spinner}>Searching...</span>}
      </div>

      {hospitalMsg && <p className={styles.hospitalMsg}>{hospitalMsg}</p>}

      {searchResults.length > 0 && (
        <div className={styles.resultsDropdown}>
          {searchResults.map((hosp) => {
            const isAlreadyLinked = myHospitals.some(
              (l) => l.hospitalId._id === hosp._id
            );
            return (
              <div key={hosp._id} className={styles.resultItem}>
                <div>
                  <p className={styles.hospName}>{hosp.name}</p>
                  <p className={styles.hospMeta}>
                    {hosp.publicId || hosp.hospitalCode} • {hosp.address}
                  </p>
                </div>
                {isAlreadyLinked ? (
                  <span className={styles.linkedText}>Linked</span>
                ) : (
                  <button
                    onClick={() => handleConnect(hosp._id)}
                    disabled={connectingId === hosp._id}
                    className={styles.connectBtn}
                  >
                    {connectingId === hosp._id ? "Connecting..." : "Connect"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}