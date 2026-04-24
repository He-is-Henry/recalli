"use client";

import { useTheme } from "@/app/hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button className={styles.btn} onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? "☀︎" : "☾"}
    </button>
  );
}
