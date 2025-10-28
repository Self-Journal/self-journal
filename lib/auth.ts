import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { userOperations } from './db';

console.log('NextAuth Config - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NextAuth Config - NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Auth: authorize called with username:', credentials?.username);

        if (!credentials?.username || !credentials?.password) {
          console.log('Auth: missing credentials');
          return null;
        }

        try {
          const user = await userOperations.verifyPassword(
            credentials.username as string,
            credentials.password as string
          );

          if (user) {
            console.log('Auth: user verified successfully:', { id: user.id, username: user.username });
            return {
              id: user.id.toString(),
              name: user.username
            };
          }

          console.log('Auth: user verification failed - user not found or password incorrect');

          // In demo mode, try to find if user exists
          if (process.env.DEMO_MODE === 'true' && credentials.username === 'demo') {
            try {
              const demoUser = await userOperations.findByUsername('demo');
              if (!demoUser) {
                console.error('Auth: DEMO USER NOT FOUND IN DATABASE! Run: npm run seed:demo');
              } else {
                console.log('Auth: demo user exists but password verification failed');
              }
            } catch (err) {
              console.error('Auth: error checking demo user:', err);
            }
          }

          return null;
        } catch (error) {
          console.error('Auth: error during authorization:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('Auth: JWT callback - setting token.id:', user.id);
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
