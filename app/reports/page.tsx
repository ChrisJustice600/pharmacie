"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Calendar,
  Download,
  FileText,
  Package,
  TrendingUp,
} from "lucide-react";

export default function ReportsPage() {
  const handleDownload = (type: string) => {
    const link = document.createElement("a");
    link.href = `/api/reports?type=${type}`;
    link.download = `${type}_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapports & Export</h1>
        <p className="text-gray-600 mt-1">
          Générez des rapports et exportez vos données
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Rapport d'Inventaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              État actuel des stocks pour tous les produits
            </p>
            <Button
              onClick={() => handleDownload("inventory")}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historique des Mouvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Tous les mouvements de stock (entrées, sorties, ajustements)
            </p>
            <Button
              onClick={() => handleDownload("movements")}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Rapport des Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Historique des alertes (stock bas, péremption)
            </p>
            <Button onClick={() => handleDownload("alerts")} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Télécharger CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Produits Périmant Bientôt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Produits dont la date de péremption approche (30 jours)
            </p>
            <Button
              onClick={() => handleDownload("expiring")}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rapport de Pertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Produits périmés et pertes enregistrées
            </p>
            <Button disabled className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rapport de Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Historique des ventes et sorties de stock
            </p>
            <Button disabled className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations sur les Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Les rapports sont exportés au format CSV, compatible avec Excel
            </p>
            <p>• Les dates sont formatées selon les paramètres régionaux</p>
            <p>
              • Les données incluent toutes les informations pertinentes pour
              chaque rapport
            </p>
            <p>
              • Les rapports de ventes et pertes seront disponibles dans une
              future mise à jour
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
