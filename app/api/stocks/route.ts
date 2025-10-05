import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stocks = await prisma.stock.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
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
    const {
      productId,
      quantity,
      expiration,
      lotNumber,
      supplier,
      deliveryDoc,
    } = body;

    if (!productId || !quantity || !expiration) {
      return NextResponse.json(
        { error: "Product ID, quantity, and expiration are required" },
        { status: 400 }
      );
    }

    // Create stock entry
    const stock = await prisma.stock.create({
      data: {
        productId,
        quantity,
        expiration: new Date(expiration),
        lotNumber,
        supplier,
        deliveryDoc,
      },
      include: { product: true },
    });

    // Create movement record
    await prisma.stockMovement.create({
      data: {
        productId,
        userId: user.id,
        type: "ENTRY",
        quantity,
        reason: "Stock addition",
        reference: lotNumber || `Entry-${Date.now()}`,
      },
    });

    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    console.error("Error creating stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
