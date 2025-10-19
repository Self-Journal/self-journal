import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { userOperations } from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = userOperations.verifyPassword(
          credentials.username as string,
          credentials.password as string
        );

        if (user) {
          return {
            id: user.id.toString(),
            name: user.username
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt'
  }
});
