import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateAlerts } from "../alerts/route";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate alerts
    await generateAlerts();

    // Total stock available
    const totalStock = await prisma.stock.aggregate({
      _sum: { quantity: true },
    });

    // Products with low stock (below minStock)
    const productsWithStocks = await prisma.product.findMany({
      where: { minStock: { gt: 0 } },
      include: { stocks: true },
    });

    const lowStockProducts = productsWithStocks.filter((product) => {
      const totalQuantity = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );
      return totalQuantity < product.minStock;
    });

    // Products expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoonProducts = await prisma.stock.findMany({
      where: {
        expiration: { lte: thirtyDaysFromNow, gt: new Date() },
      },
      include: { product: true },
    });

    // Expired products
    const expiredProducts = await prisma.stock.findMany({
      where: {
        expiration: { lt: new Date() },
        quantity: { gt: 0 },
      },
      include: { product: true },
    });

    // Pending alerts
    const pendingAlerts = await prisma.alert.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      totalStock: totalStock._sum.quantity || 0,
      lowStockCount: lowStockProducts.length,
      expiringSoonCount: expiringSoonProducts.length,
      expiredCount: expiredProducts.length,
      pendingAlerts,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
