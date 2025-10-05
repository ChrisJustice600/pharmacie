import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const session = await prisma.inventorySession.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
          orderBy: { product: { name: "asc" } },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching inventory session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, items } = body;

    if (action === "update_items") {
      // Update counted quantities
      for (const item of items) {
        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: {
            countedQty: item.countedQty,
            difference: item.countedQty - item.systemQty,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "complete") {
      // Complete the session
      const session = await prisma.inventorySession.update({
        where: { id },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
        },
        include: { items: true },
      });

      // Optionally, create stock movements for adjustments
      for (const item of session.items) {
        if (item.difference !== 0 && item.adjustment) {
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              userId: user.id,
              type: "ADJUSTMENT",
              quantity: item.difference,
              reason: `Ajustement inventaire - Session ${id}`,
            },
          });

          // Update stock quantities if needed (this is simplified)
          // In a real app, you might need to adjust specific stock entries
        }
      }

      return NextResponse.json(session);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating inventory session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
