"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, ApiError } from "@/lib/api";
import styles from "./layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => {
        if (user.role !== "admin") {
          router.replace("/levels");
        } else {
          setChecking(false);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          console.log(401);
          router.replace("/login");
        } else {
          router.replace("/levels");
        }
      });
  }, [router]);

  if (checking) {
    return (
      <div className={styles.loaderWrapper}>
        <div className={styles.tileGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={styles.tile}
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
