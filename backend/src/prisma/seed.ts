// Seed de catálogo de demostración — e-commerce-syrox
// Ejecutar con: npm run prisma:seed
//
// Idempotente: identificar por nombre de categoría (único en el esquema) y por
// (categoría, nombre) para productos (el nombre de producto NO es único).
// No borra ni sobrescribe registros existentes.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

interface SeedProduct {
  name: string;
  price: string;
  description: string;
}

interface SeedCategory {
  name: string;
  description: string;
  products: SeedProduct[];
}

const DEMO_CATEGORIES: SeedCategory[] = [
  {
    name: "Tacones elegantes",
    description:
      "Tacones de silueta depurada para ocasiones especiales y looks formales.",
    products: [
      {
        name: "Slingback Noir",
        price: "1899.00",
        description:
          "Slingback de tacón medio en piel negra, correa ajustable y punta fina para un acabado atemporal.",
      },
      {
        name: "Satin Heel",
        price: "2199.00",
        description:
          "Tacón de satén con brillo sutil y forro acolchado, ideal para eventos de noche.",
      },
      {
        name: "Classic Pump",
        price: "1699.00",
        description:
          "Pump clásico de tacón stiletto y perfil redondeado, un básico versátil de fondo de armario.",
      },
    ],
  },
  {
    name: "Sneakers",
    description:
      "Zapatillas urbanas que combinan comodidad diaria con diseño contemporáneo.",
    products: [
      {
        name: "Essential White",
        price: "1299.00",
        description:
          "Sneaker minimalista en blanco total, corte bajo y suela de goma para uso diario.",
      },
      {
        name: "Retro Court",
        price: "1599.00",
        description:
          "Sneaker de inspiración retro con detalles en contraste y silueta de cancha clásica.",
      },
      {
        name: "Urban Runner",
        price: "1899.00",
        description:
          "Runner urbano con mediasuela amortiguada y malla transpirable para jornadas largas.",
      },
    ],
  },
  {
    name: "Botas",
    description:
      "Botas de construcción robusta para clima frío y estilo de temporada.",
    products: [
      {
        name: "Chelsea Black",
        price: "2299.00",
        description:
          "Bota Chelsea en piel negra con elásticos laterales y suela de tracción ligera.",
      },
      {
        name: "Desert Boot",
        price: "1899.00",
        description:
          "Bota tipo desert en ante con cordones y suela crepe, cómoda y de perfil casual.",
      },
      {
        name: "Combat Boot",
        price: "2699.00",
        description:
          "Bota combat de caña alta, cordones reforzados y suela gruesa para máximo agarre.",
      },
    ],
  },
  {
    name: "Sandalias",
    description:
      "Sandalias ligeras y versátiles para el día a día y la temporada cálida.",
    products: [
      {
        name: "Minimal Slide",
        price: "899.00",
        description:
          "Sandalia slide de una sola pieza con plantilla suave y estilo desenfadado.",
      },
      {
        name: "Leather Strap",
        price: "1199.00",
        description:
          "Sandalia de tiras de piel con hebilla ajustable y acabado artesanal.",
      },
      {
        name: "Platform Sandal",
        price: "1499.00",
        description:
          "Sandalia de plataforma alta con tiras cruzadas y plantilla acolchada para mayor confort.",
      },
    ],
  },
];

export interface SeedResult {
  categoriesCreated: number;
  categoriesReused: number;
  productsCreated: number;
  productsSkipped: number;
}

export async function runSeed(prisma: PrismaClient): Promise<SeedResult> {
  const result: SeedResult = {
    categoriesCreated: 0,
    categoriesReused: 0,
    productsCreated: 0,
    productsSkipped: 0,
  };

  for (const category of DEMO_CATEGORIES) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category.name },
      select: { id: true },
    });

    const categoryRecord = existingCategory
      ? existingCategory
      : await prisma.category.create({
          data: {
            name: category.name,
            description: category.description,
          },
          select: { id: true },
        });

    if (existingCategory) {
      result.categoriesReused += 1;
    } else {
      result.categoriesCreated += 1;
    }

    for (const product of category.products) {
      // `Product.name` no es único en el esquema: la identidad segura del
      // registro de demostración es la pareja (categoryId, name).
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: product.name,
          categoryId: categoryRecord.id,
        },
        select: { id: true },
      });

      if (existingProduct) {
        result.productsSkipped += 1;
        continue;
      }

      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: categoryRecord.id,
        },
      });
      result.productsCreated += 1;
    }
  }

  return result;
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida. Revisa el archivo .env del backend.",
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const result = await runSeed(prisma);
    console.log("Seed de catálogo de demostración completado.");
    console.log(
      `  Categorías: ${result.categoriesCreated} creadas, ${result.categoriesReused} reutilizadas`,
    );
    console.log(
      `  Productos:  ${result.productsCreated} creados, ${result.productsSkipped} ya existían`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Solo se ejecuta como script directo (node dist/prisma/seed.js), nunca al
// importarse desde la aplicación.
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  await main();
}
