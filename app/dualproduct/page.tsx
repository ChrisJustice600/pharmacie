"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  PackagePlus,
  PlusCircle,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  minStock: number;
  sellingPrice: number;
}

interface StockFormData {
  quantity: number;
}

export default function DualProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState<ProductFormData>({
    name: "",
    description: "",
    minStock: 0,
    sellingPrice: 0,
  });
  const [stockData, setStockData] = useState<StockFormData>({
    quantity: 0,
  });

  const handleProductChange = (
    field: keyof ProductFormData,
    value: string | number
  ) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStockChange = (
    field: keyof StockFormData,
    value: number
  ) => {
    setStockData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!productData.name.trim()) {
      toast.error("Le nom du produit est obligatoire");
      return false;
    }
    if (productData.minStock < 0) {
      toast.error("Le stock minimum ne peut pas être négatif");
      return false;
    }
    if (productData.sellingPrice < 0) {
      toast.error("Le prix de vente ne peut pas être négatif");
      return false;
    }
    if (!stockData.quantity || stockData.quantity <= 0) {
      toast.error("La quantité doit être supérieure à 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Créer d'abord le produit
      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productData.name.trim(),
          description: productData.description.trim() || undefined,
          minStock: productData.minStock,
          sellingPrice: productData.sellingPrice || undefined,
        }),
      });

      if (!productResponse.ok) {
        const error = await productResponse.json();
        throw new Error(error.error || "Erreur lors de la création du produit");
      }

      const product = await productResponse.json();

      // Créer le stock associé avec une date d'expiration par défaut (dans 1 an)
      const defaultExpiration = new Date();
      defaultExpiration.setFullYear(defaultExpiration.getFullYear() + 1);

      const stockResponse = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: stockData.quantity,
          expiration: defaultExpiration.toISOString(),
        }),
      });

      if (!stockResponse.ok) {
        const error = await stockResponse.json();
        throw new Error(error.error || "Erreur lors de la création du stock");
      }

      toast.success("Produit et stock créés avec succès !");
      router.push("/products");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue s'est produite"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux produits
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Création Produit + Stock
          </h1>
          <p className="text-gray-600 mt-1">
            Créez un produit et ajoutez son stock initial en une seule opération
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du Produit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-blue-600" />
              Informations du Produit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => handleProductChange("name", e.target.value)}
                  placeholder="Ex: Paracétamol 500mg"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={productData.description}
                  onChange={(e) =>
                    handleProductChange("description", e.target.value)
                  }
                  placeholder="Ex: Comprimés pelliculés pour le traitement de la douleur"
                />
              </div>

              <div>
                <Label htmlFor="minStock">Stock minimum</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={productData.minStock}
                  onChange={(e) =>
                    handleProductChange(
                      "minStock",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice">Prix de vente (€)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productData.sellingPrice}
                  onChange={(e) =>
                    handleProductChange(
                      "sellingPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Initial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-green-600" />
              Stock Initial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="quantity">Quantité à ajouter *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={stockData.quantity}
                onChange={(e) =>
                  handleStockChange("quantity", parseInt(e.target.value) || 0)
                }
                placeholder="Ex: 100"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Le stock sera créé avec une date d'expiration par défaut (1 an)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Créer le Produit et le Stock
              </>
            )}
          </Button>
          <Link href="/products">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
