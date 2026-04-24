"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  adminGetLevel,
  adminUpdateLevel,
  adminDeleteLevel,
  LevelWithPattern,
  ApiError,
} from "@/lib/api";
import PatternPicker from "@/components/PatternPicker";
import styles from "./[id].module.css";

export default function EditLevelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [original, setOriginal] = useState<LevelWithPattern | null>(null);
  const [rows, setRows] = useState<number>(4);
  const [cols, setCols] = useState<number>(4);
  const [story, setStory] = useState("");
  const [audio, setAudio] = useState("");
  const [video, setVideo] = useState("");
  const [pattern, setPattern] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadLevel = useCallback(async () => {
    try {
      const data = await adminGetLevel(id);
      setOriginal(data);
      setRows(data.grid[0]);
      setCols(data.grid[1]);
      setStory(data.story);
      setAudio(data.audio ?? "");
      setVideo(data.video ?? "");
      setPattern(data.pattern);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load level");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLevel();
  }, [loadLevel]);

  const handleGridChange = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);
    setPattern([]);
  };

  const handleSave = async () => {
    if (pattern.length === 0) {
      setError("Select at least one tile for the pattern.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await adminUpdateLevel(id, {
        grid: [rows, cols],
        pattern,
        story,
        ...(audio ? { audio } : {}),
        ...(video ? { video } : {}),
      });
      router.push("/admin/levels");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save level");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await adminDeleteLevel(id);
      router.push("/admin/levels");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete level",
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loaderGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={styles.loaderTile}
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </main>
    );
  }

  if (error && !original) {
    return (
      <main className={styles.main}>
        <p className={styles.error}>{error}</p>
        <button
          className={styles.backBtn}
          onClick={() => router.push("/admin/levels")}
        >
          ← Back
        </button>
      </main>
    );
  }

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
          <h1 className={styles.title}>Edit Level {original?.level}</h1>
        </header>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Rows</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={10}
                value={rows}
                onChange={(e) => handleGridChange(Number(e.target.value), cols)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cols</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={10}
                value={cols}
                onChange={(e) => handleGridChange(rows, Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Story</label>
            <textarea
              className={styles.textarea}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Audio URL <span className={styles.optional}>(optional)</span>
            </label>
            <input
              className={styles.input}
              type="url"
              value={audio}
              onChange={(e) => setAudio(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Video URL <span className={styles.optional}>(optional)</span>
            </label>
            <input
              className={styles.input}
              type="url"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Pattern</label>
            <p className={styles.patternHint}>
              Click tiles to toggle pattern selection. Changing grid size resets
              the pattern.
            </p>
            <PatternPicker
              rows={rows}
              cols={cols}
              pattern={pattern}
              onChange={setPattern}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || deleting}
            >
              {saving ? <span className={styles.spinner} /> : "Save Changes"}
            </button>

            <button
              className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteBtnConfirm : ""}`}
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? (
                <span className={styles.spinner} />
              ) : confirmDelete ? (
                "Confirm Delete"
              ) : (
                "Delete Level"
              )}
            </button>
          </div>

          {confirmDelete && (
            <p className={styles.deleteWarning}>
              This will permanently delete the level. Click &quot;Confirm
              Delete&quot; to proceed or navigate away to cancel.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
