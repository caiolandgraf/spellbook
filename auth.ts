import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const email = credentials.email as string;
          const password = credentials.password as string;

          // Buscar usuário com o email fornecido
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Usuário existe, validar senha
            if (!user.password) {
              // Usuário sem senha (criado via OAuth), não permitir login
              return null;
            }

            const isPasswordValid = await bcrypt.compare(
              password,
              user.password
            );

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              username: user.username,
            };
          }

          // Usuário não existe, criar novo com senha hash
          const hashedPassword = await bcrypt.hash(password, 10);
          
          // Gerar username único baseado no email
          let username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Verificar se username já existe e adicionar número se necessário
          let usernameExists = await prisma.user.findUnique({
            where: { username }
          });
          
          let counter = 1;
          const baseUsername = username;
          while (usernameExists) {
            username = `${baseUsername}${counter}`;
            usernameExists = await prisma.user.findUnique({
              where: { username }
            });
            counter++;
          }
          
          const newUser = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: email.split("@")[0],
              username,
            },
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            image: newUser.image,
            username: newUser.username,
          };
        } catch (error) {
          console.error("Error in credentials authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
        token.username = user.username;
      }
      
      // Atualizar token quando session for atualizada
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
        token.username = session.username;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string | null | undefined;
        session.user.username = token.username as string | null | undefined;
      }
      return session;
    },
  },
  trustHost: true,
});
