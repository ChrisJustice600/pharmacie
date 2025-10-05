"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Save } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface InventoryItem {
  id: string;
  product: { name: string; description?: string };
  countedQty: number;
  systemQty: number;
  difference: number;
  adjustment: boolean;
}

interface InventorySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: "ONGOING" | "COMPLETED";
  items: InventoryItem[];
}

export default function InventorySessionPage() {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<InventorySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/inventory/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSession();
    }
  }, [id]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (!session) return;
    setSession({
      ...session,
      items: session.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              countedQty: quantity,
              difference: quantity - item.systemQty,
            }
          : item
      ),
    });
  };

  const handleAdjustmentChange = (itemId: string, adjustment: boolean) => {
    if (!session) return;
    setSession({
      ...session,
      items: session.items.map((item) =>
        item.id === itemId ? { ...item, adjustment } : item
      ),
    });
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_items",
          items: session.items,
        }),
      });
      if (res.ok) {
        alert("Sauvegardé avec succès");
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (
      !confirm("Êtes-vous sûr de vouloir terminer cette session d'inventaire ?")
    )
      return;
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      if (res.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error("Error completing session:", error);
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

  if (!session) {
    return <div className="p-6">Session not found</div>;
  }

  const totalItems = session.items.length;
  const countedItems = session.items.filter(
    (item) => item.countedQty > 0
  ).length;
  const itemsWithDifference = session.items.filter(
    (item) => item.difference !== 0
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Session d'Inventaire
          </h1>
          <p className="text-gray-600">
            Démarrée le {new Date(session.startedAt).toLocaleDateString()}
            {session.status === "COMPLETED" &&
              session.endedAt &&
              ` • Terminée le ${new Date(session.endedAt).toLocaleDateString()}`}
          </p>
        </div>
        {session.status === "ONGOING" && (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button onClick={handleComplete} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Terminer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countedItems}/{totalItems}
            </div>
            <p className="text-sm text-gray-600">produits comptés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Écarts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsWithDifference}</div>
            <p className="text-sm text-gray-600">produits avec différence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-bold ${session.status === "COMPLETED" ? "text-green-600" : "text-blue-600"}`}
            >
              {session.status === "COMPLETED" ? "Terminée" : "En cours"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produits à compter</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable maxHeight="500px">
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead className="w-1/3">Produit</DataTableHead>
                <DataTableHead className="w-20 text-center">
                  Système
                </DataTableHead>
                <DataTableHead className="w-24 text-center">
                  Compté
                </DataTableHead>
                <DataTableHead className="w-20 text-center">
                  Différence
                </DataTableHead>
                {session.status === "ONGOING" && (
                  <DataTableHead className="w-20 text-center">
                    Ajuster
                  </DataTableHead>
                )}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {session.items.map((item) => (
                <DataTableRow key={item.id}>
                  <DataTableCell>
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      {item.product.description && (
                        <div className="text-sm text-gray-500">
                          {item.product.description}
                        </div>
                      )}
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-center font-medium">
                    {item.systemQty}
                  </DataTableCell>
                  <DataTableCell className="text-center">
                    <Input
                      type="number"
                      value={item.countedQty}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      disabled={session.status === "COMPLETED"}
                      className="w-20 text-center"
                      min="0"
                    />
                  </DataTableCell>
                  <DataTableCell className="text-center">
                    <span
                      className={`font-semibold ${item.difference !== 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {item.difference > 0
                        ? `+${item.difference}`
                        : item.difference}
                    </span>
                  </DataTableCell>
                  {session.status === "ONGOING" && (
                    <DataTableCell className="text-center">
                      {item.difference !== 0 && (
                        <input
                          type="checkbox"
                          checked={item.adjustment}
                          onChange={(e) =>
                            handleAdjustmentChange(item.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      )}
                    </DataTableCell>
                  )}
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
