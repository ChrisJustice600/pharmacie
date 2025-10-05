"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Loader2,
  Minus,
  Plus,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  laboratory?: string;
  sellingPrice?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saleData, setSaleData] = useState<{
    id: string;
    total: number;
    items: CartItem[];
  } | null>(null);

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
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    if (!product.sellingPrice) {
      setErrorMessage(
        `Le produit "${product.name}" n'a pas de prix de vente défini.`
      );
      setErrorDialogOpen(true);
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const cartItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: product.sellingPrice,
        total: product.sellingPrice,
      };
      setCart([...cart, cartItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) => {
        if (item.product.id === productId) {
          const updatedItem = {
            ...item,
            quantity: newQuantity,
            total: item.unitPrice * newQuantity,
          };
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const completeSale = async (paymentMethod: string) => {
    if (cart.length === 0) {
      setErrorMessage(
        "Le panier est vide. Ajoutez des produits avant de valider la vente."
      );
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
      };

      console.log("Envoi des données de vente:", saleData);
      console.log("Total calculé côté client:", getTotal());

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (res.ok) {
        const sale = await res.json();
        setSaleData({
          id: sale.id,
          total: getTotal(),
          items: [...cart], // Sauvegarder les articles avant de vider le panier
        });
        setSuccessDialogOpen(true);
        clearCart();
      } else {
        const error = await res.json();
        setErrorMessage(error.error);
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error("Error completing sale:", error);
      setErrorMessage(
        "Une erreur inattendue s'est produite lors de la vente. Veuillez réessayer."
      );
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Caisse - Point de Vente
        </h1>
        <p className="text-gray-600 mt-1">Traitez les ventes de médicaments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recherche de Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produits Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {product.description}
                          </p>
                        )}
                        {product.laboratory && (
                          <p className="text-xs text-gray-500">
                            {product.laboratory}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        disabled={!product.sellingPrice}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {product.sellingPrice ? (
                      <div className="text-lg font-bold text-green-600">
                        {product.sellingPrice.toLocaleString()} CDF
                      </div>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Prix non défini
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Panier
                <Badge variant="secondary">{cart.length} articles</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="mx-auto h-12 w-12 mb-2" />
                  <p>Panier vide</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.unitPrice.toLocaleString()} CDF ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {cart.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {getTotal().toLocaleString()} CDF
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => completeSale("cash")}
                      disabled={loading}
                      className="flex items-center gap-2 w-full"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <DollarSign className="h-4 w-4" />
                      )}
                      {loading
                        ? "Traitement en cours..."
                        : "Valider le Paiement en Espèces"}
                    </Button>
                  </div>

                  <Button
                    onClick={clearCart}
                    variant="destructive"
                    className="w-full"
                  >
                    Vider le panier
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Vente Réussie !
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold">Vente #{saleData?.id}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {saleData?.total.toLocaleString()} CDF
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Articles vendus :</h4>
              <div className="space-y-1">
                {saleData?.items?.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span>{item.product.name}</span>
                    <span>
                      {item.quantity} × {item.unitPrice.toLocaleString()} CDF
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => setSuccessDialogOpen(false)}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </div>
          <DialogClose onClick={() => setSuccessDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erreur de Vente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-red-600 font-medium">{errorMessage}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                Vérifiez la disponibilité du stock et ajustez les quantités si
                nécessaire.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => setErrorDialogOpen(false)}
                className="w-full"
                variant="destructive"
              >
                Compris
              </Button>
            </div>
          </div>
          <DialogClose onClick={() => setErrorDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
