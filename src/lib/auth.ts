import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { JWT } from "next-auth/jwt"
import { Session, User } from "next-auth"

// Extend the User type to include role
declare module "next-auth" {
  interface User {
    role?: UserRole;
    id?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

// Extend the JWT type to include role
declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      
      // Keep the token updated with the user's role
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        });
        
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
} 