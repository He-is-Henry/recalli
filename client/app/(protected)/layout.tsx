"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import styles from "./layout.module.css";

function TileLoader() {
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

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    getMe()
      .then(() => setVerified(true))
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!verified) return <TileLoader />;

  return <>{children}</>;
}
