import { type NextAuthOptions, getServerSession } from "next-auth";
import RedditProvider from "next-auth/providers/reddit";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  providers: [
    RedditProvider({
      clientId: env.REDDIT_CLIENT_ID,
      clientSecret: env.REDDIT_CLIENT_SECRET,
      authorization: {
        params: {
          duration: "permanent",
          scope: "identity history read save"
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.image = user.image;
      }
      return session;
    }
  },
  pages: {
    signIn: "/"
  },
  secret: env.NEXTAUTH_SECRET
};

export const getCurrentSession = () => getServerSession(authOptions);
