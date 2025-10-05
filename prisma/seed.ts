import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

const laboratories = [
  "Sanofi",
  "Pfizer",
  "Novartis",
  "Roche",
  "Merck",
  "Johnson & Johnson",
  "AstraZeneca",
  "GlaxoSmithKline",
  "Bayer",
  "Boehringer Ingelheim",
  "Servier",
  "Bristol-Myers Squibb",
  "Eli Lilly",
  "Abbott",
  "Takeda",
  "Daiichi Sankyo",
  "MSD",
  "Amgen",
  "Gilead Sciences",
  "Biogen",
];

const productCategories = {
  analgesics: [
    { name: "Paracétamol", description: "Antalgique et antipyrétique" },
    { name: "Ibuprofène", description: "Anti-inflammatoire non stéroïdien" },
    {
      name: "Aspirine",
      description: "Antalgique, antipyrétique et anti-inflammatoire",
    },
    { name: "Diclofénac", description: "Anti-inflammatoire non stéroïdien" },
    { name: "Kétoprofène", description: "Anti-inflammatoire non stéroïdien" },
    { name: "Naproxène", description: "Anti-inflammatoire non stéroïdien" },
    { name: "Tramadol", description: "Antalgique opioïde" },
    { name: "Codéine", description: "Antitussif et antalgique" },
    { name: "Morphine", description: "Antalgique majeur" },
    { name: "Fentanyl", description: "Antalgique puissant" },
  ],
  antibiotics: [
    { name: "Amoxicilline", description: "Antibiotique pénicilline" },
    { name: "Azithromycine", description: "Antibiotique macrolide" },
    { name: "Ciprofloxacine", description: "Antibiotique fluoroquinolone" },
    { name: "Doxycycline", description: "Antibiotique tétracycline" },
    { name: "Métronidazole", description: "Antibiotique nitro-imidazole" },
    { name: "Clarithromycine", description: "Antibiotique macrolide" },
    { name: "Ceftriaxone", description: "Antibiotique céphalosporine" },
    { name: "Vancomycine", description: "Antibiotique glycopeptide" },
    { name: "Gentamicine", description: "Aminoside" },
    {
      name: "Triméthoprime-sulfaméthoxazole",
      description: "Antibiotique sulfamide",
    },
  ],
  cardiovascular: [
    { name: "Amlodipine", description: "Antagoniste calcique" },
    { name: "Lisinopril", description: "IEC" },
    { name: "Atorvastatine", description: "Statine" },
    { name: "Méthotrexate", description: "Immunosuppresseur" },
    { name: "Warfarine", description: "Anticoagulant" },
    { name: "Clopidogrel", description: "Antiagrégant plaquettaire" },
    { name: "Digoxine", description: "Cardiotonique" },
    { name: "Furosémide", description: "Diurétique de l'anse" },
    { name: "Spironolactone", description: "Diurétique épargneur potassique" },
    { name: "Propranolol", description: "Bêtabloquant" },
  ],
  respiratory: [
    { name: "Salbutamol", description: "Bronchodilatateur bêta-2" },
    { name: "Budesonide", description: "Corticostéroïde inhalé" },
    { name: "Montelukast", description: "Antileucotriène" },
    { name: "Théophylline", description: "Bronchodilatateur" },
    { name: "Ipratropium", description: "Anticholinergique" },
    { name: "Fluticasone", description: "Corticostéroïde nasal" },
    { name: "Dexaméthasone", description: "Corticostéroïde" },
    { name: "Prednisolone", description: "Corticostéroïde" },
    { name: "Hydrocortisone", description: "Corticostéroïde" },
    { name: "Bétaméthasone", description: "Corticostéroïde" },
  ],
  digestive: [
    { name: "Oméprazole", description: "IPP - Antiulcéreux" },
    { name: "Pantoprazole", description: "IPP - Antiulcéreux" },
    { name: "Esoméprazole", description: "IPP - Antiulcéreux" },
    { name: "Lansoprazole", description: "IPP - Antiulcéreux" },
    { name: "Ranitidine", description: "Anti-H2" },
    { name: "Dompéridone", description: "Procinétique" },
    { name: "Méclozine", description: "Antivertigineux" },
    { name: "Loperamide", description: "Antidiarrhéique" },
    { name: "Bisacodyl", description: "Laxatif stimulant" },
    { name: "Macrogol", description: "Laxatif osmotique" },
  ],
  psychiatric: [
    { name: "Sertraline", description: "Antidépresseur ISRS" },
    { name: "Paroxétine", description: "Antidépresseur ISRS" },
    { name: "Fluoxétine", description: "Antidépresseur ISRS" },
    { name: "Escitalopram", description: "Antidépresseur ISRS" },
    { name: "Venlafaxine", description: "Antidépresseur IRSN" },
    { name: "Duloxétine", description: "Antidépresseur IRSN" },
    { name: "Alprazolam", description: "Benzodiazépine anxiolytique" },
    { name: "Diazépam", description: "Benzodiazépine anxiolytique" },
    { name: "Lorazépam", description: "Benzodiazépine anxiolytique" },
    { name: "Zolpidem", description: "Hypnotique" },
  ],
  vitamins: [
    { name: "Vitamine D3", description: "Supplément vitaminique" },
    { name: "Vitamine C", description: "Antioxydant" },
    { name: "Vitamine B12", description: "Vitamine B12" },
    { name: "Acide folique", description: "Vitamine B9" },
    { name: "Fer", description: "Oligo-élément" },
    { name: "Calcium", description: "Minéral" },
    { name: "Magnésium", description: "Minéral" },
    { name: "Zinc", description: "Oligo-élément" },
    { name: "Iode", description: "Oligo-élément" },
    { name: "Oméga-3", description: "Acides gras essentiels" },
  ],
  dermatology: [
    { name: "Benzoyl peroxide", description: "Traitement acné" },
    { name: "Rétinoïde", description: "Dérivé vitamine A" },
    { name: "Hydroquinone", description: "Dépigmentant" },
    { name: "Clotrimazole", description: "Antifongique" },
    { name: "Miconazole", description: "Antifongique" },
    { name: "Kétoconazole", description: "Antifongique" },
    { name: "Perméthrine", description: "Antiparasitaire" },
    { name: "Bétaméthasone", description: "Corticostéroïde topique" },
    { name: "Tacrolimus", description: "Immunosuppresseur topique" },
    { name: "Pimecrolimus", description: "Immunosuppresseur topique" },
  ],
  ophthalmology: [
    { name: "Timolol", description: "Bêtabloquant ophtalmique" },
    { name: "Latanoprost", description: "Analogue prostaglandine" },
    { name: "Dorzolamide", description: "Inhibiteur anhydrase carbonique" },
    { name: "Tobramycine", description: "Antibiotique ophtalmique" },
    { name: "Ofloxacine", description: "Antibiotique fluoroquinolone" },
    { name: "Dexaméthasone", description: "Corticostéroïde ophtalmique" },
    { name: "Acide hyaluronique", description: "Larme artificielle" },
    { name: "Tétrahydrozoline", description: "Vasoconstricteur" },
    { name: "Atropine", description: "Parasympatholytique" },
    { name: "Cyclopentolate", description: "Parasympatholytique" },
  ],
  oncology: [
    { name: "Tamoxifène", description: "SERM anti-œstrogène" },
    { name: "Létrozole", description: "Inhibiteur aromatase" },
    { name: "Anastrozole", description: "Inhibiteur aromatase" },
    { name: "Exémestane", description: "Inhibiteur aromatase" },
    { name: "Paclitaxel", description: "Taxane" },
    { name: "Docétaxel", description: "Taxane" },
    { name: "Irinotécan", description: "Antitopoisomérase" },
    { name: "Oxaliplatine", description: "Agent alkylant" },
    { name: "Capécitabine", description: "Analogique pyrimidique" },
    { name: "Imatinib", description: "Inhibiteur tyrosine kinase" },
  ],
  vaccines: [
    { name: "Vaccin grippe", description: "Vaccin antigrippal" },
    { name: "Vaccin DTP", description: "Diphtérie-Tétanos-Poliomyélite" },
    { name: "Vaccin hépatite B", description: "Vaccin anti-hépatite B" },
    { name: "Vaccin HPV", description: "Vaccin papillomavirus" },
    { name: "Vaccin pneumocoque", description: "Vaccin antipneumococcique" },
    { name: "Vaccin méningocoque", description: "Vaccin antiméningococcique" },
    { name: "Vaccin rougeole-oreillons-rubéole", description: "Vaccin ROR" },
    { name: "Vaccin varicelle", description: "Vaccin antivaricelleux" },
    { name: "Vaccin zona", description: "Vaccin anti-zona" },
    { name: "Vaccin COVID-19", description: "Vaccin anti-COVID-19" },
  ],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Début du seeding de la base de données...");

  const products = [];
  let productCount = 0;

  // Générer 500 produits
  for (let i = 0; i < 500; i++) {
    const categoryKeys = Object.keys(productCategories) as Array<
      keyof typeof productCategories
    >;
    const randomCategory = getRandomElement(categoryKeys);
    const categoryProducts = productCategories[randomCategory];
    const baseProduct = getRandomElement(categoryProducts);

    // Générer des variations pour atteindre 500 produits
    const variations = [
      "500mg",
      "250mg",
      "1000mg",
      "200mg",
      "400mg",
      "50mg",
      "75mg",
      "150mg",
      "300mg",
      "600mg",
    ];
    const forms = [
      "comprimé",
      "gélule",
      "sirop",
      "solution injectable",
      "pommade",
      "crème",
      "gel",
      "suppositoire",
      "ovule",
      "collyre",
    ];
    const packaging = [
      "boîte de 30",
      "flacon de 100ml",
      "tube de 30g",
      "boîte de 20",
      "flacon de 60ml",
      "boîte de 10",
      "tube de 50g",
      "boîte de 50",
      "flacon de 150ml",
      "boîte de 100",
    ];

    const variation = getRandomElement(variations);
    const form = getRandomElement(forms);
    const pack = getRandomElement(packaging);
    const laboratory = getRandomElement(laboratories);

    const productName = `${baseProduct.name} ${variation} ${form}`;
    const fullDescription = `${baseProduct.description} - ${pack}`;

    // Prix en Francs Congolais (CDF) - prix réalistes pour médicaments
    const baseSellingPrices = {
      analgesics: { min: 1500, max: 8500 }, // Paracétamol, Ibuprofène, etc.
      antibiotics: { min: 5000, max: 25000 }, // Antibiotiques plus chers
      cardiovascular: { min: 3000, max: 15000 }, // Médicaments cardiovasculaires
      respiratory: { min: 4000, max: 18000 }, // Médicaments respiratoires
      digestive: { min: 2000, max: 12000 }, // Anti-acides, etc.
      psychiatric: { min: 8000, max: 35000 }, // Psychotropes plus chers
      vitamins: { min: 1000, max: 6000 }, // Suppléments moins chers
      dermatology: { min: 3000, max: 15000 }, // Dermatologiques
      ophthalmology: { min: 2500, max: 10000 }, // Ophtalmologiques
      oncology: { min: 50000, max: 200000 }, // Traitements oncologiques très chers
      vaccines: { min: 15000, max: 75000 }, // Vaccins
    };

    const categoryPrices = baseSellingPrices[randomCategory];
    const sellingPrice = getRandomInt(categoryPrices.min, categoryPrices.max);
    // Prix d'achat = 60-80% du prix de vente
    const costPrice = Math.round(sellingPrice * (0.6 + Math.random() * 0.2));

    products.push({
      name: productName,
      description: fullDescription,
      laboratory: laboratory,
      minStock: getRandomInt(5, 50), // Stock minimum entre 5 et 50
      sellingPrice: sellingPrice,
      costPrice: costPrice,
    });

    productCount++;
    if (productCount % 50 === 0) {
      console.log(`📦 ${productCount} produits générés...`);
    }
  }

  // Insérer les produits par lots pour éviter les timeouts
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await prisma.product.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(
      `✅ Lot ${Math.floor(i / batchSize) + 1} inséré (${batch.length} produits)`
    );
  }

  console.log("🎉 Seeding terminé ! 500 produits créés avec succès.");
  console.log("📊 Statistiques :");
  console.log(`   • Total produits : ${products.length}`);
  console.log(`   • Laboratoires représentés : ${laboratories.length}`);
  console.log(
    `   • Catégories médicales : ${Object.keys(productCategories).length}`
  );
  console.log(
    `   • Prix en Francs Congolais (CDF) : ✅ Appliqués à tous les produits`
  );
  console.log(`   • Prix de vente : 1,000 - 200,000 CDF selon la catégorie`);
  console.log(`   • Prix d'achat : 60-80% du prix de vente`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
