"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import WhatsappButton from "./WhatsappButton";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <WhatsappButton />}
    </>
  );
} 