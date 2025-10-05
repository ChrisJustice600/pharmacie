import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "./prisma";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.EMAIL_FROM}`,
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        text: `Cliquez sur le lien pour réinitialiser votre mot de passe : ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      await resend.emails.send({
        from: `${process.env.EMAIL_FROM}`,
        to: user.email,
        subject: "Vérification de votre adresse email",
        text: `Cliquez sur le lien pour vérifier votre email : ${verificationUrl}`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
});
