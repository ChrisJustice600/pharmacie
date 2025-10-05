"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Loader2,
  Package,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StockMovement {
  id: string;
  product: { name: string };
  user: { name: string; email: string };
  type: "ENTRY" | "SALE" | "ADJUSTMENT" | "RETURN" | "EXPIRATION";
  quantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      const res = await fetch("/api/movements");
      if (res.ok) {
        const data = await res.json();
        setMovements(data);
      }
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "ENTRY":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "SALE":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case "ADJUSTMENT":
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case "RETURN":
        return <Package className="h-4 w-4 text-yellow-500" />;
      case "EXPIRATION":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "ENTRY":
        return "bg-green-100 text-green-800";
      case "SALE":
        return "bg-red-100 text-red-800";
      case "ADJUSTMENT":
        return "bg-blue-100 text-blue-800";
      case "RETURN":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRATION":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ENTRY":
        return "Entrée";
      case "SALE":
        return "Vente";
      case "ADJUSTMENT":
        return "Ajustement";
      case "RETURN":
        return "Retour";
      case "EXPIRATION":
        return "Péremption";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Historique des Mouvements
        </h1>
        <p className="text-gray-600 mt-1">
          Suivez tous les mouvements de stock
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mouvements de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div className="flex items-center gap-3">
                  {getMovementIcon(movement.type)}
                  <div>
                    <h3 className="font-semibold">{movement.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Par {movement.user.name} ({movement.user.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(movement.createdAt).toLocaleString()}
                    </p>
                    {movement.reason && (
                      <p className="text-sm">Raison: {movement.reason}</p>
                    )}
                    {movement.reference && (
                      <p className="text-sm">Référence: {movement.reference}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getMovementColor(movement.type)}`}
                  >
                    {getTypeLabel(movement.type)}
                  </span>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      movement.type === "ENTRY" || movement.type === "RETURN"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {movement.type === "ENTRY" || movement.type === "RETURN"
                      ? "+"
                      : "-"}
                    {Math.abs(movement.quantity)}
                  </p>
                </div>
              </div>
            ))}
            {movements.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucun mouvement enregistré
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
