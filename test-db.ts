import prisma from "./lib/prisma";

async function testDatabase() {
  try {
    console.log("🔍 Test de connexion à la base de données...");

    // Test connection
    await prisma.$connect();
    console.log("✅ Connexion à la base de données réussie");

    // Count products
    const productCount = await prisma.product.count();
    console.log(`📦 Nombre de produits dans la base : ${productCount}`);

    // Count stocks
    const stockCount = await prisma.stock.count();
    console.log(`📊 Nombre de stocks dans la base : ${stockCount}`);

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Nombre d'utilisateurs dans la base : ${userCount}`);

    if (productCount === 0) {
      console.log(
        "⚠️  Aucun produit trouvé. Lancez le seed avec : npm run seed"
      );
    }

    if (userCount === 0) {
      console.log(
        "⚠️  Aucun utilisateur trouvé. Inscrivez-vous d'abord sur /auth/signup"
      );
    }
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données :", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
