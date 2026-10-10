import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
export const authOptions: NextAuthOptions = {
  providers: [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? '', clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '' })],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/signin', error: '/signin' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.id) return false;
      await prisma.user.upsert({
        where: { id: user.id },
        update: { email: user.email, name: user.name },
        create: { id: user.id, email: user.email, name: user.name },
      });
      return true;
    },
    async session({ session, token }) { if (session.user && token.sub) session.user.id = token.sub; return session; },
  },
};
