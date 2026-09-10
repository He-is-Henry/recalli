"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getMe } from "@/lib/api";
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    getMe()
      .then((user) => {
        if (user.role === "hospital_admin" || user.role === "hospital_staff") {
          router.replace("/hospital/dashboard");
        } else {
          router.replace("/levels");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Loading dashboard...</p>
    </div>
  );
}