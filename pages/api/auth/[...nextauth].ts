// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        user: { label: "User", type: "text" },
        pass: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"user" | "pass", string> | undefined,
        req: any
      ): Promise<{ id: string; name: string } | null> {
        if (!credentials) return null;
        const { user, pass } = credentials;
        if (user === process.env.AUTH_USER && pass === process.env.AUTH_PASS) {
          return { id: user, name: user };
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 1. Saat logout, NextAuth default ke '/', makanya sering ke halaman utama
      //    Maka, jika url mengandung 'auth/signin', redirect ke halaman login
      if (url.includes("/auth/signin")) return `${baseUrl}/auth/signin`;

      // 2. Jika url mengandung '/dashboard' (setelah login), redirect ke dashboard
      if (url.includes("/dashboard")) return `${baseUrl}/dashboard`;

      // 3. Kalau ada url path lain yang relatif, redirect ke path itu
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // 4. Jika url adalah absolut dan masih satu origin
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}

      // 5. Fallback (kalau url aneh), ke dashboard saja
      return `${baseUrl}/dashboard`;
    },
  },
};

export default NextAuth(authOptions);
