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
import { authClient, signIn } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SignInFormSchema = z.object({
  image: z.string().nullable(),
  name: z.string(),
});

type SignInFormValues = z.infer<typeof SignInFormSchema>;

type providerEnum = Parameters<typeof signIn.social>[0]["provider"];

export function AccountForm(props: {
  defaultValues: z.infer<typeof SignInFormSchema>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: props.defaultValues,
  });

  async function onSubmit(values: SignInFormValues) {
    setIsSubmitting(true);
    try {
      await authClient.updateUser(
        {
          name: values.name,
          image: values.image,
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
      setIsSubmitting(false);
    }
  }

  async function signInWithProvider(provider: providerEnum) {
    setIsSigningIn(true);
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
    } finally {
      setIsSigningIn(false);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
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
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
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
