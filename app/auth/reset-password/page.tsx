"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription>Token de réinitialisation manquant</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function onSubmit(formData: FormData) {
    const password = formData.get("password");
    setIsLoading(true);
    try {
      await authClient.resetPassword(
        {
          newPassword: String(password),
          token: String(token),
        },
        {
          onSuccess: () => {
            toast.success("Mot de passe réinitialisé avec succès");
            router.push("/auth/signin");
            router.refresh();
          },
          onError: (ctx: { error: { message: string } }) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch {
      toast.error("Une erreur est survenue lors de la réinitialisation");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Réinitialiser le mot de passe</CardTitle>
        <CardDescription>Entrez votre nouveau mot de passe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input type="password" id="password" name="password" />
          </div>
          <Button disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Réinitialisation en cours...
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Chargement...</CardTitle>
        <CardDescription>Veuillez patienter</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
