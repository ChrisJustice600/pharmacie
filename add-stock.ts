import { PrismaClient } from "./lib/generated/prisma";

const prisma = new PrismaClient();

async function addStock() {
  console.log("Ajout de stock aux premiers produits...");

  // Récupérer les 10 premiers produits
  const products = await prisma.product.findMany({
    take: 10,
  });

  for (const product of products) {
    // Ajouter du stock avec une date d'expiration dans 2 ans
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 2);

    await prisma.stock.create({
      data: {
        productId: product.id,
        quantity: Math.floor(Math.random() * 50) + 10, // 10-60 unités
        expiration: expirationDate,
        lotNumber: `LOT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        supplier: "Fournisseur Test",
      },
    });

    console.log(`Stock ajouté pour ${product.name}`);
  }

  console.log("Stock ajouté avec succès !");
}

addStock()
  .catch((e) => {
    console.error("Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
