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
import styles from "../app/(protected)/levels/levels.module.css";

export default function HealthcareSection() {
  const [myHospitals, setMyHospitals] = useState<PopulatedPatientHospitalLink[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & connect modal state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [hospitalMsg, setHospitalMsg] = useState("");

  const fetchHospitals = async () => {
    try {
      const data = await getMyHospitals();
      setMyHospitals(data);
      if (data.length > 0 && !selectedHospitalId) {
        setSelectedHospitalId(data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load hospitals", err);
    }
  };

  useEffect(() => {
    fetchHospitals();
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
      await fetchHospitals();
    } catch (err) {
      setHospitalMsg(
        err instanceof ApiError ? err.message : "Failed to connect to hospital"
      );
    } finally {
      setConnectingId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setHospitalMsg("");
  };

  const activeHospital = myHospitals.find((h) => h._id === selectedHospitalId) || myHospitals[0];

  return (
    <section className={styles.hospitalSection}>
      <h2 className={styles.sectionTitle}>Healthcare Providers</h2>

      {/* Header wrapper for tabs and pinned button */}
      <div className={styles.tabsHeaderWrapper}>
        <div className={styles.hospitalTabsRow}>
          {myHospitals.map((link) => {
            const isActive = activeHospital?._id === link._id;
            return (
              <button
                key={link._id}
                onClick={() => setSelectedHospitalId(link._id)}
                className={`${styles.hospitalTab} ${isActive ? styles.hospitalTabActive : ""}`}
              >
                <span className={styles.tabDot} data-status={link.status} />
                <span className={styles.tabName}>{link.hospitalId.name}</span>
              </button>
            );
          })}
        </div>

        {/* Pinned action button */}
        <button
          className={styles.addHospitalTabBtn}
          onClick={() => setIsModalOpen(true)}
        >
          + Link Provider
        </button>
      </div>

      {/* Selected Hospital Panel */}
      {activeHospital ? (
        <div className={styles.activeHospitalPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle}>{activeHospital.hospitalId.name}</h3>
              <p className={styles.panelMeta}>
                Code: {activeHospital.hospitalId.publicId || activeHospital.hospitalId.hospitalCode}
              </p>
            </div>
            <span
              className={
                activeHospital.status === "ACTIVE"
                  ? styles.statusActive
                  : styles.statusPending
              }
            >
              {activeHospital.status === "ACTIVE"
                ? "Connected ✓"
                : "Pending Verification ⏳"}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.emptyHospitalState}>
          <p>No healthcare providers linked yet.</p>
          <button
            className={styles.primaryBtn}
            onClick={() => setIsModalOpen(true)}
          >
            Link Your First Provider
          </button>
        </div>
      )}

      {/* Search & Link Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Link Healthcare Provider</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search hospital by name or ID (e.g. HOSP-1)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
              {isSearching && (
                <span className={styles.spinner}>Searching...</span>
              )}
            </div>

            {hospitalMsg && (
              <p className={styles.hospitalMsg}>{hospitalMsg}</p>
            )}

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
                          {connectingId === hosp._id
                            ? "Connecting..."
                            : "Connect"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}