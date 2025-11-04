"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

// Componente para sincronizar tokens con localStorage
function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window === "undefined" || !session) return () => {};

    // Pequeño delay para asegurar que NextAuth ya guardó su estructura inicial
    const timeoutId = setTimeout(() => {
      try {
        // Buscar TODAS las keys de nextauth
        const allNextAuthKeys = Object.keys(localStorage).filter(key => key.includes('nextauth'));
        console.log('[TokenSync] Todas las keys de nextauth encontradas:', allNextAuthKeys);
        
        // Intentar con todas las keys, pero preferir la que tenga 'session' en el nombre
        const sessionKey = allNextAuthKeys.find(key => key.includes('session')) || allNextAuthKeys[0];
        const nextAuthKey = sessionKey || allNextAuthKeys.find(key => key.includes('nextauth'));
        
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
    }, 100); // Delay de 100ms para dar tiempo a NextAuth
    
    return () => clearTimeout(timeoutId);
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