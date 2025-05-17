import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Use simple secret for development, real secret for production
const secret =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXTAUTH_SECRET
    : 'dev-secret-for-local-development';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember Me', type: 'checkbox' },
      },
      async authorize(credentials) {
        // Hard-coded credentials check
        if (
          credentials?.username === 'botbot' &&
          credentials?.password === 'r1r1r1'
        ) {
          return {
            id: '1',
            name: 'botbot',
            role: 'admin',
            remember:
              credentials.remember === 'on' || credentials.remember === 'true',
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.remember = user.remember;
        token.createdAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.remember = token.remember as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret,
});

export { handler as GET, handler as POST };
