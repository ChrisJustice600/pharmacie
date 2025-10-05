import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.alert.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await generateAlerts();

    return NextResponse.json({ message: "Alerts generated successfully" });
  } catch (error) {
    console.error("Error generating alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Function to generate alerts (can be called periodically)
async function generateAlerts() {
  try {
    // Low stock alerts
    const productsWithStocks = await prisma.product.findMany({
      where: { minStock: { gt: 0 } },
      include: { stocks: true },
    });

    for (const product of productsWithStocks) {
      const totalQuantity = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );
      if (totalQuantity < product.minStock) {
        // Check if alert already exists
        const existingAlert = await prisma.alert.findFirst({
          where: {
            productId: product.id,
            type: "LOW_STOCK",
            status: "PENDING",
          },
        });
        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              productId: product.id,
              type: "LOW_STOCK",
              message: `Stock bas: ${totalQuantity} unités restantes (minimum: ${product.minStock})`,
            },
          });
        }
      }
    }

    // Expiry alerts
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringStocks = await prisma.stock.findMany({
      where: {
        expiration: { lte: thirtyDaysFromNow, gt: new Date() },
      },
      include: { product: true },
    });

    for (const stock of expiringStocks) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          productId: stock.productId,
          type: "EXPIRY_SOON",
          status: "PENDING",
        },
      });
      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            productId: stock.productId,
            type: "EXPIRY_SOON",
            message: `Péremption proche: ${new Date(stock.expiration).toLocaleDateString()}`,
          },
        });
      }
    }

    // Expired alerts
    const expiredStocks = await prisma.stock.findMany({
      where: {
        expiration: { lt: new Date() },
        quantity: { gt: 0 },
      },
      include: { product: true },
    });

    for (const stock of expiredStocks) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          productId: stock.productId,
          type: "EXPIRED",
          status: "PENDING",
        },
      });
      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            productId: stock.productId,
            type: "EXPIRED",
            message: `Produit périmé: ${new Date(stock.expiration).toLocaleDateString()}`,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error generating alerts:", error);
  }
}
