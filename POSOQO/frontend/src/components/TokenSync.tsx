"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { syncTokensWithLocalStorage } from "@/lib/api";

export default function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      syncTokensWithLocalStorage(session);
    }
  }, [session]);

  return null;
} 