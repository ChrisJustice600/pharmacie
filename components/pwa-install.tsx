"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Smartphone, Monitor } from "lucide-react";
import { usePWAInstall } from "@/lib/pwa-utils";
import { useState } from "react";
import { toast } from "sonner";

export function PWAAssist() {
  const { isInstallable, installPWA } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!isInstallable) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success) {
        toast.success("Application installée avec succès !");
        setIsOpen(false);
      } else {
        toast.error("Installation annulée");
      }
    } catch (error) {
      toast.error("Erreur lors de l'installation");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Download className="h-4 w-4" />
        Installer l'App
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Installer PharmaTrack
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Installez l'application pour un accès rapide et une utilisation hors ligne.
            </p>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-green-600" />
                  Installation Bureau
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">
                  Ajoutez PharmaTrack à votre bureau Windows pour un accès rapide.
                </p>
                <Button onClick={handleInstall} disabled={isInstalling} className="w-full">
                  {isInstalling ? "Installation..." : "Installer sur le Bureau"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  Installation Mobile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">
                  Ajoutez PharmaTrack à votre écran d'accueil Android.
                </p>
                <Button onClick={handleInstall} disabled={isInstalling} variant="outline" className="w-full">
                  {isInstalling ? "Installation..." : "Installer sur Mobile"}
                </Button>
              </CardContent>
            </Card>

            <div className="text-xs text-gray-500 text-center">
              L'application fonctionnera hors ligne après installation
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}