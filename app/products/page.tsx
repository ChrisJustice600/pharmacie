"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Archive, Edit, Loader2, PackagePlus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MessageModal } from "@/components/ui/message-modal";

interface Product {
  id: string;
  name: string;
  description?: string;
  laboratory?: string;
  minStock: number;
  sellingPrice?: number;
  costPrice?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // États pour les modales
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });

  const [archiveModal, setArchiveModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });

  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", variant: "info" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    laboratory: "",
    minStock: 0,
    sellingPrice: 0,
    costPrice: 0,
  });

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
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
          name: "",
          description: "",
          laboratory: "",
          minStock: 0,
          sellingPrice: 0,
          costPrice: 0,
        });
        fetchProducts();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      laboratory: product.laboratory || "",
      minStock: product.minStock,
      sellingPrice: product.sellingPrice || 0,
      costPrice: product.costPrice || 0,
    });
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;

    const product = deleteModal.product;
    setDeletingId(product.id);

    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (res.ok) {
        const result = await res.json();
        setMessageModal({
          isOpen: true,
          title: "Succès",
          message: result.message || "Produit supprimé avec succès",
          variant: "success",
        });
        fetchProducts();
      } else {
        const error = await res.json();

        // Si le produit a des ventes, proposer l'archivage
        if (res.status === 400 && error.error.includes("ventes associées")) {
          setDeleteModal({ isOpen: false, product: null });
          setArchiveModal({ isOpen: true, product });
        } else {
          setMessageModal({
            isOpen: true,
            title: "Erreur",
            message: error.error || "Erreur lors de la suppression du produit",
            variant: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessageModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur de connexion. Veuillez réessayer.",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const confirmArchive = async () => {
    if (!archiveModal.product) return;

    const product = archiveModal.product;
    setDeletingId(product.id);

    try {
      const res = await fetch(`/api/products/${product.id}?action=archive`, {
        method: "DELETE",
      });
      if (res.ok) {
        const result = await res.json();
        setMessageModal({
          isOpen: true,
          title: "Succès",
          message: result.message || "Produit archivé avec succès",
          variant: "success",
        });
        fetchProducts();
      } else {
        const error = await res.json();
        setMessageModal({
          isOpen: true,
          title: "Erreur",
          message: error.error || "Erreur lors de l'archivage du produit",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error archiving product:", error);
      setMessageModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur de connexion. Veuillez réessayer.",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
      setArchiveModal({ isOpen: false, product: null });
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      laboratory: "",
      minStock: 0,
      sellingPrice: 0,
      costPrice: 0,
    });
    setShowForm(true);
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
            Gestion des Produits
          </h1>
          <p className="text-gray-600 mt-1">
            Ajoutez et gérez votre catalogue de médicaments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Produit
          </Button>
          <Link href="/dualproduct">
            <Button variant="outline">
              <PackagePlus className="h-4 w-4 mr-2" />
              Produit + Stock
            </Button>
          </Link>
          <Link href="/products/archive">
            <Button variant="outline">
              <Archive className="h-4 w-4 mr-2" />
              Archives
            </Button>
          </Link>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Modifier le Produit" : "Nouveau Produit"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="laboratory">Laboratoire</Label>
                <Input
                  id="laboratory"
                  value={formData.laboratory}
                  onChange={(e) =>
                    setFormData({ ...formData, laboratory: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="minStock">Stock Minimum</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minStock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice">Prix de Vente (€)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sellingPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="costPrice">Prix d'Achat (€)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingProduct ? "Modification..." : "Création..."}
                    </>
                  ) : editingProduct ? (
                    "Modifier"
                  ) : (
                    "Créer"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
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
          <CardTitle>Liste des Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-sm">
                    Laboratoire: {product.laboratory} | Stock Min:{" "}
                    {product.minStock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    disabled={deletingId === product.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    title="Supprimer définitivement"
                  >
                    {deletingId === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={confirmDelete}
        title="Confirmation de suppression"
        description={
          deleteModal.product
            ? `Êtes-vous sûr de vouloir supprimer définitivement le produit "${deleteModal.product.name}" ?\n\nCette action est irréversible et supprimera toutes les données associées.`
            : ""
        }
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={deletingId === deleteModal.product?.id}
      />

      <ConfirmationModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, product: null })}
        onConfirm={confirmArchive}
        title="Archivage du produit"
        description={
          archiveModal.product
            ? `Le produit "${archiveModal.product.name}" a des ventes associées. Voulez-vous l'archiver à la place ?\n\nL'archivage préservera toutes les données historiques.`
            : ""
        }
        confirmText="Archiver"
        cancelText="Annuler"
        variant="warning"
        isLoading={deletingId === archiveModal.product?.id}
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ isOpen: false, title: "", message: "", variant: "info" })}
        title={messageModal.title}
        message={messageModal.message}
        variant={messageModal.variant}
      />
    </div>
  );
}
