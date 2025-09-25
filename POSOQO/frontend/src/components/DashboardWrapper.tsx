"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import WhatsappButton from "./WhatsappButton";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");

  return (
    <>
      {!isDashboard && !isAuthPage && <Navbar />}
      {children}
      {!isDashboard && !isAuthPage && <WhatsappButton />}
    </>
  );
} 