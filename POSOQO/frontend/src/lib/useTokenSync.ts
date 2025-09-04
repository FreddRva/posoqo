"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function useTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session && typeof window !== "undefined") {
      try {
        const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
        if (nextAuthKey) {
          const currentData = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
          currentData.data = {
            ...currentData.data,
            accessToken: (session as any).accessToken,
            refreshToken: (session as any).refreshToken,
            accessTokenExpires: (session as any).accessTokenExpires,
          };
          localStorage.setItem(nextAuthKey, JSON.stringify(currentData));
        }
      } catch (err) {
        // Error silencioso al sincronizar tokens
      }
    }
  }, [session]);
} 