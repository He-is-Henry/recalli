"use client";

import { ApiError, getAdmins, makeAdmins } from "@/lib/api";
import { ChangeEvent, SubmitEvent, useEffect, useState } from "react";
import styles from "./Admin.module.css";

export default function AdminPage() {
  const [admins, setAdmins] = useState<
    { email: string; role: string; _id: string }[]
  >([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onEmailSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await makeAdmins(email);
      setEmail("");

      const updated = await getAdmins();
      setAdmins(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed request");
    }
  };

  useEffect(() => {
    getAdmins()
      .then(setAdmins)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load admins",
        ),
      );
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Control</h1>
        <p className={styles.subtitle}>Manage system administrators</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.list}>
          {admins.length > 0 ? (
            admins.map((a) => (
              <div className={styles.item} key={a._id}>
                {a.email}
                <span style={{ opacity: 0.4, fontSize: "0.75rem" }}>
                  {a.role}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.empty}>No admins yet</div>
          )}
        </div>

        <form className={styles.form} onSubmit={onEmailSubmit}>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={onEmailChange}
            placeholder="Enter admin email"
          />
          <button className={styles.button}>Make admin</button>
        </form>
      </div>
    </main>
  );
}
