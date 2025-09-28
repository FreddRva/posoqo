import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    // Provider para login con Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Provider para login con email/password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validar formato de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(credentials.email)) {
          return null;
        }

        try {
          // Llamar al backend para autenticar
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "User-Agent": "POSOQO-Frontend/1.0"
            },
            body: JSON.stringify({
              email: credentials.email.toLowerCase().trim(),
              password: credentials.password
            }),
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          
          // Validar respuesta del backend
          if (!data.user || !data.tokens) {
            return null;
          }
          
          // Guardar tokens en el usuario para el callback jwt
          return {
            id: data.user?.id?.toString(),
            name: data.user?.name?.substring(0, 100), // Limitar longitud
            email: data.user?.email,
            role: data.user?.role,
            accessToken: data.tokens?.access_token,
            refreshToken: data.tokens?.refresh_token,
            accessTokenExpires: Date.now() + (data.tokens?.expires_in || 900) * 1000,
          };
        } catch (error) {
          // Error silencioso para evitar logs innecesarios
          return null;
        }
      }
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: "/login", // Usar nuestra página personalizada
  },
  callbacks: {
    async signIn({ user, account }) {
      // Solo para usuarios de Google, crear/actualizar en backend y obtener access token propio
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: user.name, email: user.email }),
          });
          if (res.ok) {
            const data = await res.json();
            // Guardar el access token propio en el usuario para el callback jwt
            (user as any).backendAccessToken = data.tokens?.access_token;
            (user as any).backendRefreshToken = data.tokens?.refresh_token;
            (user as any).accessTokenExpires = Date.now() + (data.tokens?.expires_in || 900) * 1000;
            (user as any).role = data.role || data.user?.role;
            (user as any).id = data.id || data.user?.id;
          }
        } catch (e) {
          // Ignora errores para no bloquear el login
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Si es el primer login, guarda los tokens del usuario
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.accessToken = (user as any).accessToken || (user as any).backendAccessToken;
        token.refreshToken = (user as any).refreshToken || (user as any).backendRefreshToken;
        token.accessTokenExpires = (user as any).accessTokenExpires;
      }

      // Si el token ya tiene accessToken y no ha expirado, retorna
      if (
        token.accessToken &&
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // Si el token expiró, intenta refrescarlo
      if (token.refreshToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: token.refreshToken }),
          });
          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.tokens?.access_token;
            token.refreshToken = data.tokens?.refresh_token;
            token.accessTokenExpires = Date.now() + (data.tokens?.expires_in || 900) * 1000;
            return token;
          } else {
            token.accessToken = undefined;
            token.refreshToken = undefined;
            token.accessTokenExpires = undefined;
            return token;
          }
        } catch (e) {
          token.accessToken = undefined;
          token.refreshToken = undefined;
          token.accessTokenExpires = undefined;
          return token;
        }
      }

      // Si no hay refresh token, retorna el token (NextAuth cerrará sesión)
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
      (session as any).refreshToken = typeof token.refreshToken === "string" ? token.refreshToken : undefined;
      (session as any).accessTokenExpires = token.accessTokenExpires;
      
      // Usa el rol del token si existe
      if (token.role) {
        (session.user as any).role = token.role;
      }
      if (token.id) {
        (session.user as any).id = token.id;
      }
      
      // Solo consulta el backend si NO hay rol en el token
      if (session.user?.email && !token.role) {
        try {
          const headers: Record<string, string> = {};
          if ((session as any).accessToken) {
            headers["Authorization"] = `Bearer ${(session as any).accessToken}`;
          }
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/by-email/${session.user.email}`, {
            headers,
          });
          if (res.ok) {
            const data = await res.json();
            (session.user as any).role = data.user?.role || "client";
          } else if (res.status === 401) {
            if (typeof window !== "undefined") {
              // @ts-ignore
              import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/login" }));
            }
            (session.user as any).role = "client";
          } else {
            (session.user as any).role = "client";
          }
        } catch (err) {
          (session.user as any).role = "client";
        }
      }
      
      // Sincronizar tokens con localStorage si estamos en el cliente
      if (typeof window !== "undefined") {
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
      
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 