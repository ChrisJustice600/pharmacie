"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SignInFormSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(4, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

type SignInFormValues = z.infer<typeof SignInFormSchema>;

type providerEnum = Parameters<typeof signIn.social>[0]["provider"];

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    try {
      await signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: () => {
            router.push("/auth");
            router.refresh();
          },
          onError: (ctx: { error: { message: string } }) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch {
      toast.error("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithProvider(provider: providerEnum) {
    setIsGithubLoading(true);
    try {
      await signIn.social(
        {
          provider: provider,
          callbackURL: "/auth",
        },
        {
          onSuccess: () => {
            router.push("/auth");
          },
          onError: (ctx: { error: { message: string } }) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch {
      toast.error("Une erreur est survenue lors de la connexion");
    } finally {
      setIsGithubLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="" {...field} />
              </FormControl>
              <div className="flex justify-end">
                <Link
                  href="/auth/forget-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Mot de passe oublié
                </Link>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>
          <Button
            onClick={() => signInWithProvider("github")}
            variant="outline"
            className="w-full"
            type="button"
            disabled={isGithubLoading}
          >
            {isGithubLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Continuer avec GitHub
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
