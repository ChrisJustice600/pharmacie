"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Alert {
  id: string;
  productId: string;
  product: { name: string };
  type: "LOW_STOCK" | "EXPIRY_SOON" | "EXPIRED";
  message: string;
  status: "PENDING" | "RESOLVED";
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    } finally {
      setResolvingId(null);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "LOW_STOCK":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "EXPIRY_SOON":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "EXPIRED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "LOW_STOCK":
        return "border-orange-200 bg-orange-50";
      case "EXPIRY_SOON":
        return "border-yellow-200 bg-yellow-50";
      case "EXPIRED":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
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

  const pendingAlerts = alerts.filter((alert) => alert.status === "PENDING");
  const resolvedAlerts = alerts.filter((alert) => alert.status === "RESOLVED");

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Alertes & Notifications
        </h1>
        <p className="text-gray-600 mt-1">
          Surveillez les problèmes de stock et de péremption
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertes en Attente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAlerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingAlerts.filter((a) => a.type === "LOW_STOCK").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Péremption</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                pendingAlerts.filter(
                  (a) => a.type === "EXPIRY_SOON" || a.type === "EXPIRED"
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertes en Attente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-4 border rounded ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h3 className="font-semibold">{alert.product.name}</h3>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolve(alert.id)}
                  disabled={resolvingId === alert.id}
                >
                  {resolvingId === alert.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Résolution...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Résoudre
                    </>
                  )}
                </Button>
              </div>
            ))}
            {pendingAlerts.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucune alerte en attente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Alertes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {resolvedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 border rounded bg-green-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">{alert.product.name}</h3>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      Résolu le {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {resolvedAlerts.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucune alerte résolue
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
