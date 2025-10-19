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

        const user = await userOperations.verifyPassword(
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
      if (session.user && token.id) {
        // Validate that user still exists in database
        try {
          const userId = parseInt(token.id as string);
          const userExists = await userOperations.findById(userId);

          if (!userExists) {
            // User no longer exists, invalidate session
            throw new Error('User not found');
          }

          session.user.id = token.id as string;
        } catch (error) {
          // If user doesn't exist, return null to invalidate session
          console.error('Session validation error:', error);
          throw new Error('Invalid session');
        }
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt'
  }
});
