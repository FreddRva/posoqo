import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import DashboardWrapper from "@/components/DashboardWrapper";
import { NotificationProvider } from "@/components/NotificationSystem";
import { RecentlyViewedProvider } from "@/lib/recentlyViewedContext";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "POSOQO",
  description: "POSOQO Restaurante",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <CartProvider>
            <NotificationProvider>
              <RecentlyViewedProvider>
                <DashboardWrapper>
                {children}
                </DashboardWrapper>
              </RecentlyViewedProvider>
            </NotificationProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}