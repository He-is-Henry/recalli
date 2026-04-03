"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateLevel, ApiError } from "@/lib/api";
import LevelForm, { LevelFormData } from "@/components/LevelForm";
import styles from "./new.module.css";

interface JsonEntry {
  data: LevelFormData;
  error: string;
  success: boolean;
}

export default function NewLevelPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"single" | "json">("single");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [entries, setEntries] = useState<JsonEntry[]>([]);
  const [savingAll, setSavingAll] = useState(false);

  // Single mode
  const handleSingleSave = async (data: LevelFormData) => {
    await adminCreateLevel({ ...data, grid: [data.grid[0], data.grid[1]] });
    router.push("/admin/levels");
  };

  // JSON mode — parse
  const handleParse = () => {
    setJsonError("");
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setJsonError("Input must be a JSON array.");
        return;
      }
      setEntries(
        parsed.map((item) => ({
          data: item as LevelFormData,
          error: "",
          success: false,
        })),
      );
    } catch {
      setJsonError("Invalid JSON — check your syntax.");
    }
  };

  // Save single entry from JSON list
  const handleEntrySave = async (index: number, data: LevelFormData) => {
    try {
      await adminCreateLevel({ ...data, grid: [data.grid[0], data.grid[1]] });
      setEntries((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, error: "", success: true } : e,
        ),
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save";
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, error: msg } : e)),
      );
      throw err;
    }
  };

  // Save all
  const handleSaveAll = async () => {
    setSavingAll(true);
    await Promise.allSettled(
      entries.map((entry, i) =>
        entry.success ? Promise.resolve() : handleEntrySave(i, entry.data),
      ),
    );
    setSavingAll(false);
  };

  const pendingCount = entries.filter((e) => !e.success).length;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/admin/levels")}
          >
            ← Back
          </button>
          <h1 className={styles.title}>New Level</h1>

          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${mode === "single" ? styles.modeActive : ""}`}
              onClick={() => setMode("single")}
            >
              Single
            </button>
            <button
              className={`${styles.modeBtn} ${mode === "json" ? styles.modeActive : ""}`}
              onClick={() => setMode("json")}
            >
              JSON
            </button>
          </div>
        </header>

        {mode === "single" && (
          <LevelForm onSave={handleSingleSave} saveLabel="Save Level" />
        )}

        {mode === "json" && (
          <div className={styles.jsonMode}>
            {entries.length === 0 ? (
              <div className={styles.jsonInputSection}>
                <label className={styles.label}>Paste JSON Array</label>
                <textarea
                  className={styles.jsonTextarea}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='[{ "level": 1, "grid": [3, 3], "pattern": [1,2,3], "story": "..." }]'
                  rows={12}
                />
                {jsonError && <p className={styles.error}>{jsonError}</p>}
                <button className={styles.parseBtn} onClick={handleParse}>
                  Load Levels →
                </button>
              </div>
            ) : (
              <>
                <div className={styles.jsonHeader}>
                  <p className={styles.jsonSummary}>
                    {entries.filter((e) => e.success).length} of{" "}
                    {entries.length} saved
                  </p>
                  <div className={styles.jsonActions}>
                    <button
                      className={styles.resetBtn}
                      onClick={() => {
                        setEntries([]);
                        setJsonInput("");
                      }}
                    >
                      Reset
                    </button>
                    <button
                      className={styles.saveAllBtn}
                      onClick={handleSaveAll}
                      disabled={savingAll || pendingCount === 0}
                    >
                      {savingAll ? (
                        <span className={styles.spinner} />
                      ) : (
                        `Save All (${pendingCount})`
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.entriesGrid}>
                  {entries.map((entry, i) => (
                    <LevelForm
                      key={i}
                      initial={entry.data}
                      onSave={(data) => handleEntrySave(i, data)}
                      saveLabel="Save"
                      error={entry.error}
                      success={entry.success}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
