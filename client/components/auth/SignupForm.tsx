"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError, signup, registerHospital } from "@/lib/api";
import { setToken } from "@/lib/auth";
import styles from "./signup.module.css";

export type AccountType = "user" | "hospital";

interface SignupFormProps {
  defaultAccountType?: AccountType;
  allowSwitching?: boolean;
}

export default function SignupForm({
  defaultAccountType = "user",
  allowSwitching = true,
}: SignupFormProps) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>(defaultAccountType);

  // User State
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Hospital Specific State (RegisterHospitalDto)
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [address, setAddress] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (accountType === "hospital") {
        await registerHospital({
          name: hospitalName,
          email: hospitalEmail,
          address: address || undefined,
          adminEmail,
          adminPassword: password,
        });

        // Redirect to login after successful registration
        router.push("/login?registered=true");
      } else {
        const { accessToken } = await signup(userEmail, password);
        setToken(accessToken);
        router.push("/levels");
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Recalli</span>
        <p className={styles.brandSub}>
          {accountType === "hospital"
            ? "Register your healthcare facility"
            : "Create your personal account"}
        </p>
      </div>

      {allowSwitching && (
        <div className={styles.tabToggle}>
          <button
            type="button"
            className={`${styles.tabBtn} ${accountType === "user" ? styles.activeTab : ""}`}
            onClick={() => {
              setAccountType("user");
              setError("");
            }}
          >
            User
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${accountType === "hospital" ? styles.activeTab : ""}`}
            onClick={() => {
              setAccountType("hospital");
              setError("");
            }}
          >
            Hospital
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {accountType === "hospital" ? (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Hospital Name</label>
              <input
                className={styles.input}
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="City Care Hospital"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Hospital Contact Email</label>
              <input
                className={styles.input}
                type="email"
                value={hospitalEmail}
                onChange={(e) => setHospitalEmail(e.target.value)}
                placeholder="contact@hospital.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Address (Optional)</label>
              <input
                className={styles.input}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Health Ave"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Admin Email</label>
              <input
                className={styles.input}
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@hospital.com"
                required
              />
            </div>
          </>
        ) : (
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              autoFocus
            />
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>
            {accountType === "hospital" ? "Admin Password" : "Password"}
          </label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Confirm Password</label>
          <input
            className={styles.input}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? (
            <span className={styles.spinner} />
          ) : accountType === "hospital" ? (
            "Register Hospital"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Log in
        </Link>
      </p>
    </div>
  );
}