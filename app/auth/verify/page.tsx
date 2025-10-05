"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await authClient.verifyEmail(
          {
            query: {
              token,
            },
          },
          {
            onSuccess: () => {
              toast.success("Email vérifié avec succès");
              router.push("/auth/signin");
              router.refresh();
            },
            onError: (ctx: { error: { message: string } }) => {
              toast.error(ctx.error.message);
              setIsVerifying(false);
            },
          }
        );
      } catch {
        toast.error("Une erreur est survenue lors de la vérification");
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription>Token de vérification manquant</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isVerifying) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Vérification en cours</CardTitle>
          <CardDescription>
            Veuillez patienter pendant la vérification de votre email...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Vérification échouée</CardTitle>
        <CardDescription>
          Le lien de vérification est invalide ou a expiré
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => router.push("/auth/signin")}>
          Retour à la connexion
        </Button>
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

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
