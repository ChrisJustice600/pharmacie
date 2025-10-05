"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Play, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface InventorySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: "ONGOING" | "COMPLETED";
  items: Array<{
    id: string;
    product: { name: string };
    countedQty: number;
    systemQty: number;
    difference: number;
  }>;
}

export default function InventoryPage() {
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching inventory sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/inventory", { method: "POST" });
      if (res.ok) {
        const newSession = await res.json();
        // Redirect to session page
        window.location.href = `/inventory/${newSession.id}`;
      }
    } catch (error) {
      console.error("Error creating inventory session:", error);
    } finally {
      setCreating(false);
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

  const ongoingSession = sessions.find((s) => s.status === "ONGOING");
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos sessions d'inventaire physique
          </p>
        </div>
        {!ongoingSession && (
          <Button onClick={handleCreateSession} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Inventaire
              </>
            )}
          </Button>
        )}
      </div>

      {ongoingSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-500" />
              Session d'Inventaire en Cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Démarrée le{" "}
              {new Date(ongoingSession.startedAt).toLocaleDateString()}
            </p>
            <p>{ongoingSession.items.length} produits à compter</p>
            <div className="mt-4">
              <Link href={`/inventory/${ongoingSession.id}`}>
                <Button>Continuer l'Inventaire</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sessions Terminées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {completedSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div>
                  <h3 className="font-semibold">
                    Inventaire du{" "}
                    {new Date(session.startedAt).toLocaleDateString()}
                  </h3>
                  <p className="text-sm">
                    Terminé le{" "}
                    {session.endedAt
                      ? new Date(session.endedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-sm">
                    {session.items.length} produits •{" "}
                    {session.items.filter((i) => i.difference !== 0).length}{" "}
                    écarts
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/inventory/${session.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Rapport
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {completedSessions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucune session terminée
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
