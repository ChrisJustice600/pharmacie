import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, paymentMethod = "cash" } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    // Calculate total and validate stock
    let total = 0;
    const validatedItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];
    console.log("Calcul du total pour les items:", items);

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 }
        );
      }

      // Get product with current stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { stocks: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${productId} not found` },
          { status: 404 }
        );
      }

      if (!product.sellingPrice) {
        return NextResponse.json(
          { error: `No selling price set for ${product.name}` },
          { status: 400 }
        );
      }

      // Calculate current stock
      const currentStock = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );

      if (currentStock < quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour ${product.name}. Disponible: ${currentStock}, Demandé: ${quantity}`,
          },
          { status: 400 }
        );
      }

      const unitPrice = Number(product.sellingPrice);
      const itemTotal = unitPrice * quantity;

      validatedItems.push({
        productId,
        quantity,
        unitPrice,
        total: itemTotal,
      });

      total += itemTotal;
    }

    console.log("Total calculé côté serveur:", total);

    // Create sale in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sale
      const sale = await tx.sale.create({
        data: {
          userId: user.id,
          total,
          paymentMethod,
          items: {
            create: validatedItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Update stock quantities and create movements
      for (const item of validatedItems) {
        // Get all stock entries for this product
        const stocks = await tx.stock.findMany({
          where: { productId: item.productId },
          orderBy: { expiration: "asc" }, // Use oldest first (FIFO)
        });

        let remainingToDecrement = item.quantity;

        for (const stock of stocks) {
          if (remainingToDecrement <= 0) break;

          const decrementAmount = Math.min(
            remainingToDecrement,
            stock.quantity
          );
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: { decrement: decrementAmount } },
          });

          remainingToDecrement -= decrementAmount;
        }

        console.log(
          `Stock décrémenté pour ${item.productId}: -${item.quantity} unités`
        );

        // Create movement record
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId: user.id,
            type: "SALE",
            quantity: -item.quantity, // Negative for sales
            reason: `Vente #${sale.id}`,
            reference: sale.id,
          },
        });
      }

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
