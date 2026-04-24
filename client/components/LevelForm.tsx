"use client";

import { useState } from "react";
import PatternPicker from "./PatternPicker";
import styles from "./LevelForm.module.css";
import { ApiError } from "@/lib/api";

export interface LevelFormData {
  level: number;
  grid: [number, number];
  pattern: number[];
  story: string;
  audio?: string;
  video?: string;
}

interface Props {
  initial?: Partial<LevelFormData>;
  onSave: (data: LevelFormData) => Promise<void>;
  saveLabel?: string;
  error?: string;
  success?: boolean;
}

export default function LevelForm({
  initial,
  onSave,
  saveLabel = "Save Level",
  error,
  success,
}: Props) {
  const [levelNum, setLevelNum] = useState<number>(initial?.level ?? 1);
  const [rows, setRows] = useState<number>(initial?.grid?.[0] ?? 4);
  const [cols, setCols] = useState<number>(initial?.grid?.[1] ?? 4);
  const [story, setStory] = useState(initial?.story ?? "");
  const [audio, setAudio] = useState(initial?.audio ?? "");
  const [video, setVideo] = useState(initial?.video ?? "");
  const [pattern, setPattern] = useState<number[]>(initial?.pattern ?? []);
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGridChange = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);
    setPattern([]);
  };

  const handleSave = async () => {
    if (!story.trim()) {
      setLocalError("Story is required.");
      return;
    }
    if (pattern.length === 0) {
      setLocalError("Select at least one tile.");
      return;
    }
    setLocalError("");
    setSaving(true);
    try {
      await onSave({
        level: levelNum,
        grid: [rows, cols],
        pattern,
        story,
        ...(audio ? { audio } : {}),
        ...(video ? { video } : {}),
      });
    } catch (err) {
      setLocalError(err instanceof ApiError ? err.message : "Failed to save");
      // parent handles error display
    } finally {
      setSaving(false);
    }
  };

  const displayError = localError || error;

  return (
    <div
      className={`${styles.form} ${error ? styles.hasError : ""} ${success ? styles.hasSuccess : ""}`}
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Level Number</label>
          <input
            className={styles.input}
            type="number"
            min={1}
            value={levelNum}
            onChange={(e) => setLevelNum(Number(e.target.value))}
          />
        </div>
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
          placeholder="Write the clue story..."
          rows={3}
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
        <PatternPicker
          rows={rows}
          cols={cols}
          pattern={pattern}
          onChange={setPattern}
        />
      </div>

      {displayError && <p className={styles.error}>{displayError}</p>}
      {success && <p className={styles.successMsg}>Saved successfully</p>}

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving || success}
      >
        {saving ? <span className={styles.spinner} /> : saveLabel}
      </button>
    </div>
  );
}
