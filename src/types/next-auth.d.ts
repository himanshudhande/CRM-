import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "OWNER" | "STAFF";
  }

  interface Session {
    user: {
      id: string;
      role: "OWNER" | "STAFF";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "OWNER" | "STAFF";
  }
}
