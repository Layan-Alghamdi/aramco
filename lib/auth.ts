import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

const companyDomain = process.env.COMPANY_DOMAIN || 'adc.com';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || '',
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || ''
        }
      },
      from: process.env.EMAIL_FROM || `noreply@${companyDomain}`
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const emailAddr = user.email || (profile as any)?.email || '';
      if (!emailAddr.endsWith(`@${companyDomain}`)) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = user.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  session: { strategy: 'database' },
  secret: process.env.NEXTAUTH_SECRET
};

export function requireRole(role: Role, userRole?: Role) {
  const order = [Role.VIEWER, Role.EDITOR, Role.ADMIN];
  return order.indexOf(userRole || Role.VIEWER) >= order.indexOf(role);
}

