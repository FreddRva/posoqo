import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import DashboardWrapper from "@/components/DashboardWrapper";
import { NotificationProvider } from "@/components/NotificationSystem";
import { RecentlyViewedProvider } from "@/lib/recentlyViewedContext";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundaryProvider } from "@/components/ErrorBoundaryProvider";
import { ChatbotWidget } from "@/components/ai";
import { AgeVerificationModal } from "@/components/AgeVerificationModal";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "POSOQO",
  description: "POSOQO Restaurante",
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",
    apple: "/Logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ErrorBoundaryProvider>
          <Providers>
            <CartProvider>
              <NotificationProvider>
                <RecentlyViewedProvider>
                  {/* Modal de verificación de edad - Se muestra primero */}
                  <AgeVerificationModal />
                  
                  <DashboardWrapper>
                  {children}
                  </DashboardWrapper>
                  
                  {/* Banner de cookies - Se muestra después de verificar edad */}
                  <CookieBanner />
                  
                  <ChatbotWidget />
                </RecentlyViewedProvider>
              </NotificationProvider>
            </CartProvider>
          </Providers>
        </ErrorBoundaryProvider>
      </body>
    </html>
  );
}