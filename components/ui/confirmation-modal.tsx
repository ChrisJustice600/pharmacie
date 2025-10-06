"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "warning",
  isLoading = false,
}: ConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: XCircle,
          iconColor: "text-red-600",
          buttonVariant: "destructive" as const,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-orange-600",
          buttonVariant: "default" as const,
        };
      case "info":
        return {
          icon: Info,
          iconColor: "text-blue-600",
          buttonVariant: "default" as const,
        };
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          buttonVariant: "default" as const,
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: "text-orange-600",
          buttonVariant: "default" as const,
        };
    }
  };

  const { icon: Icon, iconColor, buttonVariant } = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}