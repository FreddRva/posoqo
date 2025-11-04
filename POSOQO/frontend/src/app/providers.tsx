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
        // Usar una key separada para nuestros tokens para evitar conflictos con NextAuth
        const tokenKey = 'posoqo.auth.tokens';
        const accessToken = (session as any)?.accessToken;
        const refreshToken = (session as any)?.refreshToken;
        const accessTokenExpires = (session as any)?.accessTokenExpires;

        console.log('[TokenSync] Guardando tokens en key separada:', {
          key: tokenKey,
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length || 0,
          hasRefreshToken: !!refreshToken,
          hasExpiry: !!accessTokenExpires
        });

        // Guardar tokens en una key separada
        const tokenData = {
          accessToken,
          refreshToken,
          accessTokenExpires,
          timestamp: Date.now()
        };
        
        localStorage.setItem(tokenKey, JSON.stringify(tokenData));
        
        // Verificar que se guardó correctamente
        const verifyData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
        console.log('[TokenSync] Tokens sincronizados correctamente. Verificación:', {
          hasAccessToken: !!verifyData.accessToken,
          accessTokenLength: verifyData.accessToken?.length || 0,
          hasRefreshToken: !!verifyData.refreshToken,
          hasExpiry: !!verifyData.accessTokenExpires
        });
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