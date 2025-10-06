import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, laboratory, minStock, sellingPrice, costPrice } =
      body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        laboratory,
        minStock: minStock || 0,
        sellingPrice: sellingPrice || null,
        costPrice: costPrice || null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    // Si action=archive, archiver le produit au lieu de le supprimer
    if (action === "archive") {
      const archivedProduct = await prisma.product.update({
        where: { id },
        data: {
          name: `[ARCHIVÉ] ${new Date().toISOString().split('T')[0]} - ${id.slice(0, 8)} - ${new Date().getTime()}`,
          description: "Produit archivé - Plus disponible",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Produit archivé avec succès",
        action: "archived",
        product: archivedProduct
      });
    }

    // Si action=force-delete, suppression définitive même avec des données liées
    if (action === "force-delete") {
      return await forceDeleteProduct(id);
    }

    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stocks: true,
        movements: true,
        Alert: true,
        InventoryItem: true,
        saleItems: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Vérifier les contraintes avant suppression
    if (product.saleItems.length > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer ce produit car il a des ventes associées. Archivez-le plutôt qu'une suppression définitive.",
        },
        { status: 400 }
      );
    }

    // Supprimer en cascade dans l'ordre correct
    // 1. Supprimer les éléments d'inventaire
    if (product.InventoryItem.length > 0) {
      await prisma.inventoryItem.deleteMany({
        where: { productId: id },
      });
    }

    // 2. Supprimer les alertes
    if (product.Alert.length > 0) {
      await prisma.alert.deleteMany({
        where: { productId: id },
      });
    }

    // 3. Supprimer les mouvements de stock
    if (product.movements.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: { productId: id },
      });
    }

    // 4. Supprimer les stocks
    if (product.stocks.length > 0) {
      await prisma.stock.deleteMany({
        where: { productId: id },
      });
    }

    // 5. Supprimer le produit
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    // Gestion spécifique des erreurs de contrainte de clé étrangère
    if (error instanceof Error && error.message.includes("foreign key")) {
      return NextResponse.json(
        {
          error:
            "Ce produit ne peut pas être supprimé car il est référencé dans d'autres enregistrements. Contactez l'administrateur.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour suppression définitive forcée
async function forceDeleteProduct(id: string) {
  try {
    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stocks: true,
        movements: true,
        Alert: true,
        InventoryItem: true,
        saleItems: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Suppression en cascade forcée dans l'ordre inverse des dépendances
    // 1. Supprimer les éléments de vente (ils ont CASCADE mais vérifions)
    if (product.saleItems.length > 0) {
      await prisma.saleItem.deleteMany({
        where: { productId: id },
      });
    }

    // 2. Supprimer les éléments d'inventaire
    if (product.InventoryItem.length > 0) {
      await prisma.inventoryItem.deleteMany({
        where: { productId: id },
      });
    }

    // 3. Supprimer les alertes
    if (product.Alert.length > 0) {
      await prisma.alert.deleteMany({
        where: { productId: id },
      });
    }

    // 4. Supprimer les mouvements de stock
    if (product.movements.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: { productId: id },
      });
    }

    // 5. Supprimer les stocks
    if (product.stocks.length > 0) {
      await prisma.stock.deleteMany({
        where: { productId: id },
      });
    }

    // 6. Supprimer le produit
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Produit supprimé définitivement avec succès"
    });
  } catch (error) {
    console.error("Error force deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression définitive" },
      { status: 500 }
    );
  }
}

// Fonction pour restaurer un produit archivé
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "restore") {
      // Restaurer un produit archivé
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
      }

      if (!product.name.startsWith("[ARCHIVÉ]")) {
        return NextResponse.json(
          { error: "Ce produit n'est pas archivé" },
          { status: 400 }
        );
      }

      // Restaurer le produit en supprimant le préfixe d'archive
      const originalName = product.name.replace(/^\[ARCHIVÉ\]\s*\d{4}-\d{2}-\d{2}\s*-\s*\w+\s*-\s*\d+\s*-\s*/, "");

      const restoredProduct = await prisma.product.update({
        where: { id },
        data: {
          name: originalName,
          description: product.description?.replace("Produit archivé - Plus disponible", "").trim() || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Produit restauré avec succès",
        product: restoredProduct
      });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("Error in PATCH:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
