"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (token) {
      router.replace("/levels");
    } else {
      router.replace("/login");
    }
  }, [token, router]);

  return null;
}
