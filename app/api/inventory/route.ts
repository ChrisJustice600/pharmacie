import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.inventorySession.findMany({
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching inventory sessions:", error);
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

    // Check if there's an ongoing session
    const ongoingSession = await prisma.inventorySession.findFirst({
      where: { status: "ONGOING" },
    });

    if (ongoingSession) {
      return NextResponse.json(
        { error: "Une session d'inventaire est déjà en cours" },
        { status: 400 }
      );
    }

    // Get all products with their current stock
    const products = await prisma.product.findMany({
      include: {
        stocks: true,
      },
    });

    // Create session
    const session = await prisma.inventorySession.create({
      data: {},
    });

    // Create inventory items for each product
    const inventoryItems = products.map((product) => {
      const systemQty = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );
      return {
        sessionId: session.id,
        productId: product.id,
        countedQty: 0, // Will be updated during counting
        systemQty,
        difference: -systemQty, // Will be calculated as countedQty - systemQty
      };
    });

    await prisma.inventoryItem.createMany({
      data: inventoryItems,
    });

    const sessionWithItems = await prisma.inventorySession.findUnique({
      where: { id: session.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(sessionWithItems, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
