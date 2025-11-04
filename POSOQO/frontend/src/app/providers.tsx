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
          accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null,
          hasRefreshToken: !!refreshToken,
          hasExpiry: !!accessTokenExpires,
          nextAuthKey: nextAuthKey,
          currentDataKeys: Object.keys(currentData),
          currentDataDataKeys: currentData.data ? Object.keys(currentData.data) : []
        });

        // Asegurar que data existe
        if (!currentData.data) {
          currentData.data = {};
        }

        currentData.data = {
          ...currentData.data,
          accessToken,
          refreshToken,
          accessTokenExpires,
        };
        
        const savedData = JSON.stringify(currentData);
        localStorage.setItem(nextAuthKey, savedData);
        
        // Verificar que se guardó correctamente
        const verifyData = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
        console.log('[TokenSync] Tokens sincronizados correctamente. Verificación:', {
          hasData: !!verifyData.data,
          hasAccessToken: !!verifyData.data?.accessToken,
          accessTokenLength: verifyData.data?.accessToken?.length || 0,
          verifyDataKeys: Object.keys(verifyData),
          verifyDataDataKeys: verifyData.data ? Object.keys(verifyData.data) : []
        });
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