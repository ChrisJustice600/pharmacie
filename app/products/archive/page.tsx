"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { MessageModal } from "@/components/ui/message-modal";
import {
  Archive,
  ArrowLeft,
  Loader2,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ArchivedProduct {
  id: string;
  name: string;
  description?: string;
  laboratory?: string;
  minStock: number;
  sellingPrice?: number;
  costPrice?: number;
  createdAt: string;
  _count?: {
    stocks: number;
    movements: number;
    Alert: number;
    saleItems: number;
  };
}

export default function ArchivedProductsPage() {
  const [products, setProducts] = useState<ArchivedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // États pour les modales
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: ArchivedProduct | null;
  }>({ isOpen: false, product: null });

  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    product: ArchivedProduct | null;
  }>({ isOpen: false, product: null });

  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", variant: "info" });

  const fetchArchivedProducts = async () => {
    try {
      const res = await fetch("/api/products/archive");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching archived products:", error);
      toast.error("Erreur lors du chargement des produits archivés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedProducts();
  }, []);

  const handleDelete = (product: ArchivedProduct) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;

    try {
      const res = await fetch(
        `/api/products/${deleteModal.product.id}?action=force-delete`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        const result = await res.json();
        setMessageModal({
          isOpen: true,
          title: "Succès",
          message:
            result.message || "Produit supprimé définitivement avec succès",
          variant: "success",
        });
        fetchArchivedProducts();
      } else {
        const error = await res.json();
        setMessageModal({
          isOpen: true,
          title: "Erreur",
          message: error.error || "Erreur lors de la suppression du produit",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting archived product:", error);
      setMessageModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur de connexion. Veuillez réessayer.",
        variant: "error",
      });
    } finally {
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const handleRestore = (product: ArchivedProduct) => {
    setRestoreModal({ isOpen: true, product });
  };

  const confirmRestore = async () => {
    if (!restoreModal.product) return;

    try {
      const res = await fetch(
        `/api/products/${restoreModal.product.id}?action=restore`,
        {
          method: "PATCH",
        }
      );

      if (res.ok) {
        const result = await res.json();
        setMessageModal({
          isOpen: true,
          title: "Succès",
          message: result.message || "Produit restauré avec succès",
          variant: "success",
        });
        fetchArchivedProducts();
      } else {
        const error = await res.json();
        setMessageModal({
          isOpen: true,
          title: "Erreur",
          message: error.error || "Erreur lors de la restauration du produit",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error restoring product:", error);
      setMessageModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur de connexion. Veuillez réessayer.",
        variant: "error",
      });
    } finally {
      setRestoreModal({ isOpen: false, product: null });
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement des produits archivés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
            Produits Archivés
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion des produits archivés et suppression définitive
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un produit archivé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits archivés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Produits Archivés ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun produit archivé
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Les produits archivés apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-600">
                        [ARCHIVÉ]{" "}
                        {product.name.replace(
                          /^\[ARCHIVÉ\]\s*\d{4}-\d{2}-\d{2}\s*-\s*\w+\s*-\s*/,
                          ""
                        )}
                      </h3>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        ARCHIVÉ
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Laboratoire: {product.laboratory || "N/A"}</span>
                      <span>Stock min: {product.minStock}</span>
                      {product.sellingPrice && (
                        <span>Prix: {product.sellingPrice}€</span>
                      )}
                    </div>

                    {/* Statistiques */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {product._count && (
                        <>
                          <span>{product._count.stocks} stocks</span>
                          <span>{product._count.movements} mouvements</span>
                          <span>{product._count.saleItems} ventes</span>
                          <span>{product._count.Alert} alertes</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(product)}
                      title="Restaurer le produit"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={confirmDelete}
        title="Suppression définitive"
        description={
          deleteModal.product
            ? `Êtes-vous sûr de vouloir supprimer définitivement le produit "${deleteModal.product.name}" ?\n\nCette action supprimera TOUTES les données associées (stocks, mouvements, ventes, alertes) de manière IRRÉVERSIBLE.`
            : ""
        }
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, product: null })}
        onConfirm={confirmRestore}
        title="Restauration du produit"
        description={
          restoreModal.product
            ? `Voulez-vous restaurer le produit "${restoreModal.product.name.replace(/^\[ARCHIVÉ\]\s*\d{4}-\d{2}-\d{2}\s*-\s*\w+\s*-\s*/, "")}" ?\n\nLe produit redeviendra actif et disponible.`
            : ""
        }
        confirmText="Restaurer"
        cancelText="Annuler"
        variant="success"
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() =>
          setMessageModal({
            isOpen: false,
            title: "",
            message: "",
            variant: "info",
          })
        }
        title={messageModal.title}
        message={messageModal.message}
        variant={messageModal.variant}
      />
    </div>
  );
}
