//src/lib/authOptions.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { jwtDecode } from "jwt-decode";
import { User as ApiUser } from "@/lib/user/userTypes";

interface BackendAuthResponse {
  data: {
    user: ApiUser;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message?: string;
}

const getExpiryFromTokenString = (token: string): number | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch (e) {
    return null;
  }
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const backendRefreshUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh`;
    const response = await fetch(backendRefreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.backendRefreshToken }),
    });

    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;

    const newTokens = refreshedTokens.data.tokens;
    const newExpiresAt = getExpiryFromTokenString(newTokens.accessToken);

    if (!newExpiresAt) throw new Error("Refreshed token is invalid.");

    return {
      ...token,
      backendAccessToken: newTokens.accessToken,
      backendAccessTokenExpiresAt: newExpiresAt,
      backendRefreshToken: newTokens.refreshToken ?? token.backendRefreshToken,
      error: undefined,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { type: "text" },
        action: { type: "text" },
        email: { type: "email" },
        password: { type: "password" },
        username: { type: "text" },
        displayName: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { action, userId, ...payload } = credentials;
        const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        if (action === "dev-login" && userId) {
          if (process.env.NODE_ENV !== "development") {
            throw new Error("Dev login is not allowed in production.");
          }
          const res = await fetch(`${backendApiUrl}/auth/dev-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
          const responseData: BackendAuthResponse = await res.json();
          if (!res.ok)
            throw new Error(responseData.message || "Dev login failed.");
          const { user, tokens } = responseData.data;
          const expiresAt = getExpiryFromTokenString(tokens.accessToken);
          if (!user || !tokens || !expiresAt) return null;

          return {
            id: user.id,
            name: user.displayName,
            email: user.email,
            image: user.profileImage,
            username: user.username,
            systemRole: user.systemRole,
            userRole: user.userRole,
            backendAccessToken: tokens.accessToken,
            backendAccessTokenExpiresAt: expiresAt,
            backendRefreshToken: tokens.refreshToken,
          };
        }

        const endpointPath =
          action === "signup" ? "/auth/register" : "/auth/login";
        const res = await fetch(`${backendApiUrl}${endpointPath}`, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });

        const responseData: BackendAuthResponse = await res.json();
        if (!res.ok || !responseData.data) {
          throw new Error(responseData.message || "Authentication failed.");
        }

        const { user, tokens } = responseData.data;
        const expiresAt = getExpiryFromTokenString(tokens.accessToken);
        if (!user || !tokens || !expiresAt) {
          throw new Error("Invalid response from authentication service.");
        }

        return {
          id: user.id,
          name: user.displayName,
          email: user.email,
          image: user.profileImage,
          username: user.username,
          systemRole: user.systemRole,
          userRole: user.userRole,
          backendAccessToken: tokens.accessToken,
          backendAccessTokenExpiresAt: expiresAt,
          backendRefreshToken: tokens.refreshToken,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user && account) {
        if (account.provider === "credentials") {
          return { ...token, ...user };
        } else {
          const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/oauth`;
          const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile!.email!,
              name: profile!.name,
              image: profile!.image,
            }),
          });

          if (response.ok) {
            const resData: BackendAuthResponse = await response.json();
            const { user: apiUser, tokens } = resData.data;
            const expiresAt = getExpiryFromTokenString(tokens.accessToken);

            if (apiUser && tokens && expiresAt) {
              return {
                ...token,
                id: apiUser.id,
                name: apiUser.displayName,
                email: apiUser.email,
                picture: apiUser.profileImage,
                username: apiUser.username,
                systemRole: apiUser.systemRole,
                userRole: apiUser.userRole,
                backendAccessToken: tokens.accessToken,
                backendAccessTokenExpiresAt: expiresAt,
                backendRefreshToken: tokens.refreshToken,
              };
            }
          }
          return { ...token, error: "OAuthUserProcessingError" };
        }
      }
      if (Date.now() < token.backendAccessTokenExpiresAt) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.systemRole = token.systemRole;
      session.user.userRole = token.userRole;
      session.user.name = token.name ?? null;
      session.user.email = token.email ?? null;
      session.user.image = token.picture ?? null;
      session.backendAccessToken = token.backendAccessToken;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
