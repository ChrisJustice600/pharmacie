import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let data;
    let filename;

    switch (type) {
      case "inventory":
        data = await prisma.stock.findMany({
          include: { product: true },
          orderBy: { product: { name: "asc" } },
        });
        filename = "inventory_report.csv";
        break;

      case "movements":
        data = await prisma.stockMovement.findMany({
          include: {
            product: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        filename = "movements_report.csv";
        break;

      case "alerts":
        data = await prisma.alert.findMany({
          include: { product: true },
          orderBy: { createdAt: "desc" },
        });
        filename = "alerts_report.csv";
        break;

      case "expiring":
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        data = await prisma.stock.findMany({
          where: {
            expiration: { lte: thirtyDaysFromNow, gt: new Date() },
          },
          include: { product: true },
          orderBy: { expiration: "asc" },
        });
        filename = "expiring_products_report.csv";
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    // Generate CSV
    let csv = "";
    if (type === "inventory") {
      csv = "Produit,Quantité,Date de péremption,Lot,Fournisseur\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((item: any) => {
        csv += `"${item.product.name}",${item.quantity},"${new Date(item.expiration).toLocaleDateString()}","${item.lotNumber || ""}","${item.supplier || ""}"\n`;
      });
    } else if (type === "movements") {
      csv = "Date,Produit,Type,Quantité,Utilisateur,Raison,Référence\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((item: any) => {
        csv += `"${new Date(item.createdAt).toLocaleString()}","${item.product.name}","${item.type}",${item.quantity},"${item.user.name}","${item.reason || ""}","${item.reference || ""}"\n`;
      });
    } else if (type === "alerts") {
      csv = "Date,Produit,Type,Message,Status\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((item: any) => {
        csv += `"${new Date(item.createdAt).toLocaleString()}","${item.product.name}","${item.type}","${item.message}","${item.status}"\n`;
      });
    } else if (type === "expiring") {
      csv = "Produit,Quantité,Date de péremption,Lot,Fournisseur\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((item: any) => {
        csv += `"${item.product.name}",${item.quantity},"${new Date(item.expiration).toLocaleDateString()}","${item.lotNumber || ""}","${item.supplier || ""}"\n`;
      });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
