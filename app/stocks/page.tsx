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
import { Label } from "@/components/ui/label";
import { Loader2, Package2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
}

interface Stock {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  expiration: string;
  lotNumber?: string;
  supplier?: string;
  deliveryDoc?: string;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 0,
    expiration: "",
    lotNumber: "",
    supplier: "",
    deliveryDoc: "",
  });

  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/stocks");
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          productId: "",
          quantity: 0,
          expiration: "",
          lotNumber: "",
          supplier: "",
          deliveryDoc: "",
        });
        fetchStocks();
      }
    } catch (error) {
      console.error("Error adding stock:", error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Stocks
          </h1>
          <p className="text-gray-600 mt-1">
            Suivez et gérez vos niveaux de stock
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Stock
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter du Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productId">Produit *</Label>
                <select
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantité *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiration">Date de Péremption *</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={formData.expiration}
                  onChange={(e) =>
                    setFormData({ ...formData, expiration: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="lotNumber">Numéro de Lot</Label>
                <Input
                  id="lotNumber"
                  value={formData.lotNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, lotNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="supplier">Fournisseur</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="deliveryDoc">Document de Livraison</Label>
                <Input
                  id="deliveryDoc"
                  value={formData.deliveryDoc}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDoc: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Ajouter</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stocks Actuels</CardTitle>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun stock
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter du stock à vos produits.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le premier stock
                </Button>
              </div>
            </div>
          ) : (
            <DataTable maxHeight="500px">
              <DataTableHeader>
                <DataTableRow>
                  <DataTableHead className="w-1/4">Produit</DataTableHead>
                  <DataTableHead className="w-20 text-center">
                    Quantité
                  </DataTableHead>
                  <DataTableHead className="w-32 text-center">
                    Péremption
                  </DataTableHead>
                  <DataTableHead className="w-24">Lot</DataTableHead>
                  <DataTableHead className="w-32">Fournisseur</DataTableHead>
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                {stocks.map((stock) => (
                  <DataTableRow key={stock.id}>
                    <DataTableCell>
                      <div className="font-medium">{stock.product.name}</div>
                    </DataTableCell>
                    <DataTableCell className="text-center font-medium">
                      {stock.quantity}
                    </DataTableCell>
                    <DataTableCell className="text-center">
                      {new Date(stock.expiration).toLocaleDateString()}
                    </DataTableCell>
                    <DataTableCell>{stock.lotNumber || "-"}</DataTableCell>
                    <DataTableCell>{stock.supplier || "-"}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
