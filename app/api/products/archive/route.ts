import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les produits archivés (ceux dont le nom commence par [ARCHIVÉ])
    const archivedProducts = await prisma.product.findMany({
      where: {
        name: {
          startsWith: "[ARCHIVÉ]",
        },
      },
      include: {
        _count: {
          select: {
            stocks: true,
            movements: true,
            Alert: true,
            saleItems: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(archivedProducts);
  } catch (error) {
    console.error("Error fetching archived products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}