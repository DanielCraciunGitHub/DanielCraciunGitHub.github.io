import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/prisma/db"
import bcrypt from "bcrypt"

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {},
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { name, email, password } = credentials as User
        if (req.body?.callbackUrl.includes("login")) {
          const user = await prisma.user.findFirst({
            where: { email },
          })
          if (user && (await bcrypt.compare(password, user.password))) {
            return user
          } else {
            throw new Error("404")
          }
        } else {
          return await prisma.user
            .create({
              data: {
                name,
                email,
                password: await bcrypt.hash(password, 10),
                loginType: "credentials",
              },
            })
            .catch(() => {
              throw new Error("404")
            })
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/auth/error",
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, account }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email as string,
        },
      })
      if (!dbUser) {
        await prisma.user.create({
          data: {
            name: token.name as string,
            email: token.email as string,
            loginType: account?.provider as string,
            password: "null",
          },
        })
        return token
      }
      return {
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      }
    },
  },
}
