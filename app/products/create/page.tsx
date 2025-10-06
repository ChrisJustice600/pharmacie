"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    laboratory: "",
    minStock: 0,
    sellingPrice: 0,
    costPrice: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Produit créé avec succès !");
        router.push("/products");
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur lors de la création du produit");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nouveau Produit
          </h1>
          <p className="text-gray-600 mt-1">
            Ajoutez un nouveau médicament à votre catalogue
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du Produit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                placeholder="Ex: Paracétamol 500mg"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Ex: Comprimés pelliculés"
              />
            </div>

            <div>
              <Label htmlFor="laboratory">Laboratoire</Label>
              <Input
                id="laboratory"
                value={formData.laboratory}
                onChange={(e) => handleChange("laboratory", e.target.value)}
                placeholder="Ex: Sanofi, Pfizer..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="minStock">Stock Minimum</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleChange("minStock", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice">Prix de Vente (€)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange("sellingPrice", parseFloat(e.target.value) || 0)}
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="costPrice">Prix d'Achat (€)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => handleChange("costPrice", parseFloat(e.target.value) || 0)}
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le Produit"
                )}
              </Button>
              <Link href="/products">
                <Button type="button" variant="outline" disabled={submitting}>
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}