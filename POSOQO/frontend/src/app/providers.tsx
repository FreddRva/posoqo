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

        console.log('[TokenSync] Estructura actual:', {
          hasEvent: !!currentData.event,
          hasData: !!currentData.data,
          dataKeys: currentData.data ? Object.keys(currentData.data) : [],
          dataDataKeys: currentData.data?.data ? Object.keys(currentData.data.data) : []
        });

        // NextAuth guarda en formato {event: 'session', data: {...}, timestamp: ...}
        // Necesitamos guardar en data.data para que sea compatible
        if (!currentData.data) {
          currentData.data = {};
        }
        if (!currentData.data.data) {
          currentData.data.data = {};
        }

        // Guardar tokens en data.data.accessToken (estructura anidada correcta)
        currentData.data.data = {
          ...currentData.data.data,
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
          hasDataData: !!verifyData.data?.data,
          hasAccessToken: !!verifyData.data?.data?.accessToken,
          accessTokenLength: verifyData.data?.data?.accessToken?.length || 0,
          verifyDataKeys: Object.keys(verifyData),
          verifyDataDataKeys: verifyData.data ? Object.keys(verifyData.data) : [],
          verifyDataDataDataKeys: verifyData.data?.data ? Object.keys(verifyData.data.data) : []
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