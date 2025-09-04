import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    address?: string | null;
    role?: string | null;
  }
  interface Session {
    user?: User;
    accessToken?: string;
  }
} 