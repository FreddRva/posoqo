"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

// Componente para sincronizar tokens con localStorage
function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window === "undefined" || !session) return;

    try {
      const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
      if (nextAuthKey) {
        const currentData = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
        const accessToken = (session as any)?.accessToken;
        const refreshToken = (session as any)?.refreshToken;
        const accessTokenExpires = (session as any)?.accessTokenExpires;

        console.log('[TokenSync] Sincronizando tokens con localStorage:', {
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length || 0,
          hasRefreshToken: !!refreshToken,
          hasExpiry: !!accessTokenExpires
        });

        currentData.data = {
          ...currentData.data,
          accessToken,
          refreshToken,
          accessTokenExpires,
        };
        localStorage.setItem(nextAuthKey, JSON.stringify(currentData));
        console.log('[TokenSync] Tokens sincronizados correctamente');
      } else {
        console.warn('[TokenSync] No se encontró key de nextauth en localStorage');
      }
    } catch (err) {
      console.error('[TokenSync] Error sincronizando tokens:', err);
    }
  }, [session]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenSync />
      {children}
    </SessionProvider>
  );
} 